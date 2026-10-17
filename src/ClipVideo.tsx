import {
  Freeze,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ClipConfig } from "./schema";

type Props = {
  readonly clip: ClipConfig;
  /** Frame at which the clip starts playing (after the intro fade). */
  readonly startFrame: number;
  /** How many frames of the clip are shown. */
  readonly clipFrames: number;
};

/**
 * Plays the trimmed recording so that it fills its parent (the device screen)
 * with cover scaling. Before `startFrame` the first frame is held, and after
 * the clip ends its last frame is held, so a shorter clip never unmounts
 * while a longer one is still playing.
 */
export const ClipVideo: React.FC<Props> = ({ clip, startFrame, clipFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const local = frame - startFrame;
  const shownFrame = Math.min(Math.max(local, 0), clipFrames - 1);

  return (
    <Freeze frame={shownFrame}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={Math.round(clip.trimStart * fps)}
        durationInFrames={clipFrames}
        muted={clip.muted}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
        }}
      />
    </Freeze>
  );
};
