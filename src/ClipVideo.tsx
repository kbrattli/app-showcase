import {
  Freeze,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { ClipConfig } from "./schema";

/** One playback pass: the clips play from the start at `speed`. */
export type PlaybackPass = {
  /** First frame of the pass in the composition. */
  readonly start: number;
  /** Playback speed: 1 is normal, 0.5 is half speed. */
  readonly speed: number;
};

type Props = {
  readonly clip: ClipConfig;
  /** Passes in order; the first starts after the intro fade. */
  readonly passes: readonly PlaybackPass[];
  /** How many seconds of the clip are shown (per pass, at speed 1). */
  readonly clipSeconds: number;
};

/**
 * Plays the trimmed recording so that it fills its parent (the device screen)
 * with cover scaling. Each pass restarts the clip at its own speed. Before
 * the first pass the first frame is held, and after a clip ends inside a
 * pass its last frame is held, so a shorter clip never unmounts while a
 * longer one is still playing.
 */
/** The pass that is playing at `frame`; the last pass holds until the end. */
export const resolvePass = (
  frame: number,
  passes: readonly PlaybackPass[],
): PlaybackPass =>
  [...passes].reverse().find((candidate) => frame >= candidate.start) ??
  passes[0];

export const ClipVideo: React.FC<Props> = ({ clip, passes, clipSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pass = resolvePass(frame, passes);
  const clipFrames = Math.max(1, Math.round((clipSeconds / pass.speed) * fps));

  const local = frame - pass.start;
  const shownFrame = Math.min(Math.max(local, 0), clipFrames - 1);

  return (
    <Freeze frame={shownFrame}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={Math.round(clip.trimStart * fps)}
        durationInFrames={clipFrames}
        playbackRate={pass.speed}
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
