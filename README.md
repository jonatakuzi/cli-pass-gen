# cli-pass-gen

A cryptographically secure CLI password generator written in TypeScript. Generates strong, random passwords with configurable length, character sets, and real-time strength analysis.

## Features

- **Cryptographically secure** — uses `crypto.getRandomValues` (Web Crypto API) for true randomness
- **Configurable character sets** — toggle uppercase, lowercase, digits, and symbols
- **Character exclusion** — strip ambiguous characters like `0O1lI` for readability
- **Strength analysis** — entropy bits, score (0–100), and labeled strength level
- **Bulk generation** — generate multiple passwords at once with `-c`
- **Zero runtime dependencies** — only TypeScript and Node built-ins

## Getting Started

```bash
git clone https://github.com/jonatakuzi/cli-pass-gen.git
cd cli-pass-gen
npm install
```

Run directly with ts-node (no build needed):

```bash
npm run generate
# or
npx ts-node src/index.ts
```

Build and run compiled output:

```bash
npm run build
node dist/index.js
```

## Usage

```
cli-pass-gen [options]

Options:
  -l, --length <n>      Password length       (default: 16)
  -c, --count <n>       Number of passwords   (default: 1)
      --no-upper        Exclude uppercase letters
      --no-lower        Exclude lowercase letters
      --no-digits       Exclude digits
      --no-symbols      Exclude symbols
  -e, --exclude <chars> Characters to exclude (e.g. "0O1lI")
      --strength        Show strength analysis
  -h, --help            Show help
```

## Examples

Generate a default 16-character password:
```bash
npx ts-node src/index.ts
```

32-character password with strength report:
```bash
npx ts-node src/index.ts -l 32 --strength
```

5 passwords, no symbols, 12 characters:
```bash
npx ts-node src/index.ts -l 12 --no-symbols -c 5
```

Exclude ambiguous characters for human readability:
```bash
npx ts-node src/index.ts -l 20 -e "0O1lI" --strength
```

Digits-only PIN (6 characters):
```bash
npx ts-node src/index.ts -l 6 --no-upper --no-lower --no-symbols
```

## Sample Output

```
  G#7kP$mQ2vXn@Yw9

  Strength : Very Strong
  Score    : [███████████░] 94/100
  Entropy  : ~104 bits
  Length   : 16 chars
```

## Project Structure

```
cli-pass-gen/
├── src/
│   ├── index.ts      # CLI entry point — argument parsing, output formatting
│   └── generator.ts  # Core logic — charset building, generation, strength scoring
├── package.json
└── tsconfig.json
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 |
| Runtime | Node.js 18+ |
| Crypto | Node.js `crypto.webcrypto` (built-in) |
| Build | tsc (TypeScript compiler) |

## License

MIT
