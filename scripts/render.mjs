// Renders a showcase.
//
//   npm run render -- demo                 showcases/demo/showcase.json -> showcases/demo/showcase.mp4
//   npm run render -- showcases/demo       same thing
//   npm run render -- demo ~/Desktop/x.mp4 second argument = output path
//   npm run render                         examples/sample.json -> out/sample.mp4 (fresh-clone smoke test)
//   npm run render -- examples/galaxy.json examples/<name>.json -> out/<name>.mp4
//
// A showcase folder is its own Remotion public dir, so `clips[].src` is a
// file name next to showcase.json. Example configs use public/ instead.
// Every other flag is passed straight to `remotion render` as `--flag=value`
// (see https://www.remotion.dev/docs/cli/render).
import { existsSync } from "node:fs";
import path from "node:path";
import { display, root, runRemotion } from "./remotion.mjs";

const args = process.argv.slice(2);
const flags = [];
const positional = [];
let hasProps = false;
let hasPublicDir = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--props" || arg === "--public-dir") {
    if (arg === "--props") hasProps = true;
    else hasPublicDir = true;
    flags.push(`${arg}=${path.resolve(args[++i] ?? "")}`);
  } else if (arg.startsWith("--props=")) {
    hasProps = true;
    flags.push(`--props=${path.resolve(arg.slice("--props=".length))}`);
  } else if (arg.startsWith("--public-dir=")) {
    hasPublicDir = true;
    flags.push(`--public-dir=${path.resolve(arg.slice("--public-dir=".length))}`);
  } else if (arg.startsWith("-")) {
    flags.push(arg);
  } else {
    positional.push(arg);
  }
}

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const target = positional[0] ?? path.join(root, "examples", "sample.json");
let output;

if (target.endsWith(".json")) {
  // An example (or any) config: recordings come from public/.
  const props = path.resolve(target);
  if (!existsSync(props)) fail(`Config not found: ${display(props)}`);
  if (!hasProps) flags.push(`--props=${props}`);
  output = path.join(root, "out", `${path.basename(props, ".json")}.mp4`);
} else {
  // A showcase folder: `demo`, `showcases/demo` or a path to a folder.
  const asGiven = path.resolve(target);
  const folder = existsSync(path.join(asGiven, "showcase.json"))
    ? asGiven
    : path.join(root, "showcases", path.basename(target));
  const props = path.join(folder, "showcase.json");
  if (!existsSync(props)) {
    fail(
      [
        `No showcase at ${display(props)}.`,
        `Create one with:  npm run new -- <recording.mp4> --name ${path.basename(folder)}`,
        "or list what exists with:  ls showcases",
      ].join("\n"),
    );
  }
  if (!hasProps) flags.push(`--props=${props}`);
  if (!hasPublicDir) flags.push(`--public-dir=${folder}`);
  output = path.join(folder, "showcase.mp4");
}

if (positional[1]) output = path.resolve(positional[1]);

const status = runRemotion([
  "render",
  "src/index.ts",
  "Showcase",
  output,
  ...flags,
]);
if (status === 0) console.log(`\nShowcase rendered: ${display(output)}`);
process.exit(status);
