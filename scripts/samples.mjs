// Renders the two sample screen recordings into public/.
// Usage: npm run samples
import { spawnSync } from "node:child_process";

const samples = [
  ["SampleA", "public/sample-a.mp4"],
  ["SampleB", "public/sample-b.mp4"],
];

for (const [id, out] of samples) {
  const result = spawnSync(
    "npx",
    ["remotion", "render", "src/samples/index.ts", id, out, "--crf=28"],
    { stdio: "inherit", shell: process.platform === "win32" },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
