// Renders the showcase video.
//
//   npm run render                               -> out/showcase.mp4 from showcase.json
//   npm run render -- --props=examples/single.json
//   npm run render -- out/other.mp4 --props=other.json
//
// Every other flag is passed straight to `remotion render`
// (see https://www.remotion.dev/docs/cli/render).
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const flags = [];
const positional = [];
let hasProps = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--props") {
    hasProps = true;
    flags.push(arg, args[++i]);
  } else if (arg.startsWith("--props=")) {
    hasProps = true;
    flags.push(arg);
  } else if (arg.startsWith("-")) {
    flags.push(arg);
  } else {
    positional.push(arg);
  }
}

const output = positional[0] ?? "out/showcase.mp4";
if (!hasProps) {
  flags.unshift("--props=showcase.json");
}

const result = spawnSync(
  "npx",
  ["remotion", "render", "src/index.ts", "Showcase", output, ...flags],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
