import { useCurrentFrame, useVideoConfig } from "remotion";
import { resolvePass, type PlaybackPass } from "./ClipVideo";
import type { ClipConfig } from "./schema";

const TIMER_FONT =
  '"SF Mono", ui-monospace, Menlo, Consolas, "Liberation Mono", monospace';

type Props = {
  readonly clip: ClipConfig;
  readonly passes: readonly PlaybackPass[];
  readonly clipSeconds: number;
  readonly fontSize: number;
};

/**
 * Stopwatch shown under a device while a slow-motion pass plays. It counts
 * the real milliseconds of the recording between `timer.start` and
 * `timer.end`, so a 0.25x pass shows a 300 ms animation over 1.2 s. During
 * normal-speed passes the space is kept but left empty.
 */
export const ClipTimer: React.FC<Props> = ({
  clip,
  passes,
  clipSeconds,
  fontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pass = resolvePass(frame, passes);
  const timer = clip.timer;

  let text = "";
  if (timer && pass.speed < 1) {
    const clipFrames = Math.max(1, Math.round((clipSeconds / pass.speed) * fps));
    const local = Math.min(Math.max(frame - pass.start, 0), clipFrames - 1);
    const sourceTime = clip.trimStart + (local * pass.speed) / fps;
    const total = Math.round((timer.end - timer.start) * 1000);
    const elapsed = Math.round((sourceTime - timer.start) * 1000);
    text = `${Math.min(Math.max(elapsed, 0), total)} ms`;
  }

  return (
    <div
      style={{
        fontFamily: TIMER_FONT,
        fontSize,
        fontWeight: 600,
        color: "#111111",
        fontVariantNumeric: "tabular-nums",
        textAlign: "center",
        minHeight: fontSize * 1.3,
        lineHeight: 1.3,
      }}
    >
      {text}
    </div>
  );
};
