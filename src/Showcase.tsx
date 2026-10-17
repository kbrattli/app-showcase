import { AbsoluteFill } from "remotion";
import { parseShowcase } from "./loadConfig";
import type { ShowcaseInput } from "./schema";

/**
 * Top-level composition. Receives the raw showcase.json props (already
 * validated and defaulted by calculateMetadata in Root.tsx) and lays out the
 * device frames. Device frames and clips are added in later PLAN.md steps.
 */
export const Showcase: React.FC<ShowcaseInput> = (props) => {
  const config = parseShowcase(props);

  return <AbsoluteFill style={{ backgroundColor: config.background }} />;
};
