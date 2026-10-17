import { Composition, type CalculateMetadataFunction } from "remotion";
import showcaseJson from "../showcase.json";
import { parseShowcase } from "./loadConfig";
import { showcaseSchema, type ShowcaseInput } from "./schema";
import { Showcase } from "./Showcase";

/**
 * Validates the props (from showcase.json or --props) and derives the video's
 * dimensions, fps and duration from them. Nothing here is hardcoded.
 */
const calculateMetadata: CalculateMetadataFunction<ShowcaseInput> = ({ props }) => {
  const config = parseShowcase(props);
  const longestClip = Math.max(
    ...config.clips.map((clip) => (clip.trimEnd ?? 0) - clip.trimStart),
  );
  const totalSeconds = longestClip + config.intro + config.outro;

  return {
    width: config.output.width,
    height: config.output.height,
    fps: config.output.fps,
    durationInFrames: Math.max(1, Math.ceil(totalSeconds * config.output.fps)),
    props: config,
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Showcase"
      component={Showcase}
      schema={showcaseSchema}
      defaultProps={showcaseJson as ShowcaseInput}
      calculateMetadata={calculateMetadata}
    />
  );
};
