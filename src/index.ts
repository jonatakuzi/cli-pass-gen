#!/usr/bin/env node
/**
 * cli-pass-gen — Cryptographically secure CLI password generator
 */

import { generatePassword, GeneratorOptions } from "./generator";

interface CliArgs {
  length: number;
  count: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  exclude: string;
  showStrength: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args: CliArgs = {
    length: 16,
    count: 1,
    uppercase: true,
    lowercase: true,
    digits: true,
    symbols: true,
    exclude: "",
    showStrength: false,
    help: false,
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    switch (arg) {
      case "-h": case "--help": args.help = true; break;
      case "-l": case "--length": args.length = parseInt(argv[++i], 10); break;
      case "-c": case "--count": args.count = parseInt(argv[++i], 10); break;
      case "--no-upper": args.uppercase = false; break;
      case "--no-lower": args.lowercase = false; break;
      case "--no-digits": args.digits = false; break;
      case "--no-symbols": args.symbols = false; break;
      case "-e": case "--exclude": args.exclude = argv[++i] ?? ""; break;
      case "--strength": args.showStrength = true; break;
    }
  }

  return args;
}

function printHelp(): void {
  console.log(`
  cli-pass-gen — Cryptographically secure password generator

  Usage:
    npx ts-node src/index.ts [options]

  Options:
    -l, --length <n>      Password length       (default: 16)
    -c, --count <n>       Number of passwords   (default: 1)
        --no-upper        Exclude uppercase
        --no-lower        Exclude lowercase
        --no-digits       Exclude digits
        --no-symbols      Exclude symbols
    -e, --exclude <chars> Characters to exclude (e.g. "0O1l")
        --strength        Show strength analysis
    -h, --help            Show this help

  Examples:
    npx ts-node src/index.ts
    npx ts-node src/index.ts -l 24 --strength
    npx ts-node src/index.ts -l 12 --no-symbols -c 5
    npx ts-node src/index.ts -l 32 -e "0O1lI" --strength
  `);
}

function strengthBar(score: number): string {
  const filled = Math.round(score / 10);
  const bar = "█".repeat(filled) + "░".repeat(10 - filled);
  return `[${bar}] ${score}/100`;
}

function strengthColor(strength: string): string {
  const colors: Record<string, string> = {
    "Weak":        "\x1b[31m",
    "Fair":        "\x1b[33m",
    "Good":        "\x1b[36m",
    "Strong":      "\x1b[32m",
    "Very Strong": "\x1b[32m",
  };
  const reset = "\x1b[0m";
  return `${colors[strength] ?? ""}${strength}${reset}`;
}

function main(): void {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  if (args.help) { printHelp(); process.exit(0); }

  if (isNaN(args.length) || args.length < 4) {
    console.error("Error: --length must be at least 4."); process.exit(1);
  }
  if (isNaN(args.count) || args.count < 1) {
    console.error("Error: --count must be at least 1."); process.exit(1);
  }

  const opts: GeneratorOptions = {
    length: args.length,
    uppercase: args.uppercase,
    lowercase: args.lowercase,
    digits: args.digits,
    symbols: args.symbols,
    exclude: args.exclude,
  };

  console.log("");

  for (let i = 0; i < args.count; i++) {
    const result = generatePassword(opts);

    if (args.count > 1) {
      console.log(`  \x1b[90m[${i + 1}]\x1b[0m ${result.password}`);
    } else {
      console.log(`  \x1b[1m${result.password}\x1b[0m`);
    }

    if (args.showStrength) {
      console.log(`      Strength : ${strengthColor(result.strength)}`);
      console.log(`      Score    : ${strengthBar(result.score)}`);
      console.log(`      Entropy  : ~${result.entropy} bits`);
      console.log(`      Length   : ${result.password.length} chars`);
      if (i < args.count - 1) console.log("");
    }
  }

  console.log("");
}

main();
