import { Composition, type CalculateMetadataFunction } from "remotion";
import { parseShowcase } from "./loadConfig";
import { resolveClips } from "./probe";
import { showcaseSchema, type ShowcaseInput } from "./schema";
import { Showcase } from "./Showcase";

/**
 * Validates the props (the showcase.json passed with --props), reads each
 * clip's real duration from the public dir (the showcase folder, or public/
 * for the examples), and derives the video's dimensions, fps and duration.
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
  const playSeconds = resolved.speeds.reduce(
    (sum, speed) => sum + longestClip / speed,
    0,
  );
  const totalSeconds = playSeconds + resolved.intro + resolved.outro;
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
      // Only a placeholder so Studio opens without --props. Real configs come
      // from showcases/<name>/showcase.json or examples/*.json via --props.
      defaultProps={{ clips: [{ src: "sample-a.mp4" }] } as ShowcaseInput}
      calculateMetadata={calculateMetadata}
    />
  );
};
