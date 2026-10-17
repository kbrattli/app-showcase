import { Composition, type CalculateMetadataFunction } from "remotion";
import showcaseJson from "../showcase.json";
import { parseShowcase } from "./loadConfig";
import { resolveClips } from "./probe";
import { showcaseSchema, type ShowcaseInput } from "./schema";
import { Showcase } from "./Showcase";

/**
 * Validates the props (from showcase.json or --props), reads each clip's real
 * duration from public/, and derives the video's dimensions, fps and
 * duration.
 * Nothing here is hardcoded.
 */
const calculateMetadata: CalculateMetadataFunction<ShowcaseInput> = async ({
  props,
  abortSignal,
}) => {
  const config = parseShowcase(props);
  const resolved = await resolveClips(config, abortSignal);

  const longestClip = Math.max(
    ...resolved.clips.map((clip) => clip.trimEnd - clip.trimStart),
  );
  const totalSeconds = longestClip + resolved.intro + resolved.outro;
  const { width, height, fps } = resolved.output;

  return {
    width,
    height,
    fps,
    durationInFrames: Math.max(1, Math.ceil(totalSeconds * fps)),
    props: resolved,
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
