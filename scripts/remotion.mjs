// Shared by the scripts in this folder: locates the repo root and runs the
// Remotion CLI that is installed in node_modules, without going through npx
// or a shell (so paths with spaces work on every OS).
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const require = createRequire(import.meta.url);
const cliPackage = require.resolve("@remotion/cli/package.json");
const remotionCli = path.join(
  path.dirname(cliPackage),
  require(cliPackage).bin.remotion,
);

/** Runs `remotion <args>` from the repo root and returns its exit status. */
export const runRemotion = (args) => {
  const result = spawnSync(process.execPath, [remotionCli, ...args], {
    stdio: "inherit",
    cwd: root,
  });
  return result.status ?? 1;
};

/** Prints a path relative to the repo root when it is inside it. */
export const display = (file) => {
  const relative = path.relative(root, file);
  return relative && !relative.startsWith("..") ? relative : file;
};
