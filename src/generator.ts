/**
 * generator.ts — Core password generation logic
 */

export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  exclude: string;
}

export interface GeneratedPassword {
  password: string;
  strength: StrengthLevel;
  score: number;
  entropy: number;
}

export type StrengthLevel = "Weak" | "Fair" | "Good" | "Strong" | "Very Strong";

const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{}|;:,.<>?",
} as const;

export function buildCharset(opts: GeneratorOptions): string {
  let charset = "";
  if (opts.uppercase) charset += CHARSETS.uppercase;
  if (opts.lowercase) charset += CHARSETS.lowercase;
  if (opts.digits)    charset += CHARSETS.digits;
  if (opts.symbols)   charset += CHARSETS.symbols;

  if (opts.exclude) {
    const excluded = new Set(opts.exclude.split(""));
    charset = charset.split("").filter((c) => !excluded.has(c)).join("");
  }

  return charset;
}

export function generatePassword(opts: GeneratorOptions): GeneratedPassword {
  const charset = buildCharset(opts);

  if (charset.length === 0) {
    throw new Error("No character set available — enable at least one character type.");
  }

  const { webcrypto } = require("crypto") as typeof import("crypto");
  const array = new Uint32Array(opts.length);
  webcrypto.getRandomValues(array);

  const required: string[] = [];
  const pools: string[] = [];
  if (opts.uppercase) pools.push(CHARSETS.uppercase);
  if (opts.lowercase) pools.push(CHARSETS.lowercase);
  if (opts.digits)    pools.push(CHARSETS.digits);
  if (opts.symbols)   pools.push(CHARSETS.symbols);

  const extraArray = new Uint32Array(pools.length);
  webcrypto.getRandomValues(extraArray);
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i].split("").filter((c) => !opts.exclude.includes(c));
    if (pool.length > 0) {
      required.push(pool[extraArray[i] % pool.length]);
    }
  }

  const chars: string[] = [];
  for (let i = 0; i < opts.length; i++) {
    chars.push(charset[array[i] % charset.length]);
  }

  for (let i = 0; i < required.length && i < chars.length; i++) {
    chars[i] = required[i];
  }

  const shuffleArray = new Uint32Array(chars.length);
  webcrypto.getRandomValues(shuffleArray);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = shuffleArray[i] % (i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  const password = chars.join("");
  const { score, strength, entropy } = scorePassword(password, opts);

  return { password, strength, score, entropy };
}

export function scorePassword(
  password: string,
  opts: GeneratorOptions
): { score: number; strength: StrengthLevel; entropy: number } {
  let poolSize = 0;
  if (opts.uppercase) poolSize += 26;
  if (opts.lowercase) poolSize += 26;
  if (opts.digits)    poolSize += 10;
  if (opts.symbols)   poolSize += CHARSETS.symbols.length;

  const entropy = Math.round(password.length * Math.log2(poolSize || 1));

  let score = 0;
  score += Math.min(40, (password.length / 32) * 40);
  score += opts.uppercase ? 15 : 0;
  score += opts.lowercase ? 15 : 0;
  score += opts.digits    ? 15 : 0;
  score += opts.symbols   ? 15 : 0;
  score = Math.round(Math.min(100, score));

  const strength: StrengthLevel =
    score >= 90 ? "Very Strong" :
    score >= 70 ? "Strong"      :
    score >= 50 ? "Good"        :
    score >= 30 ? "Fair"        : "Weak";

  return { score, strength, entropy };
}
