// Renders the two sample screen recordings into public/.
// Usage: npm run samples
import { runRemotion } from "./remotion.mjs";

const samples = [
  ["SampleA", "public/sample-a.mp4"],
  ["SampleB", "public/sample-b.mp4"],
];

for (const [id, out] of samples) {
  const status = runRemotion([
    "render",
    "src/samples/index.ts",
    id,
    out,
    "--crf=28",
  ]);
  if (status !== 0) process.exit(status);
}
