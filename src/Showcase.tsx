import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ClipTimer } from "./ClipTimer";
import { ClipVideo, type PlaybackPass } from "./ClipVideo";
import { DeviceFrame } from "./devices/DeviceFrame";
import { getBodyAspect, getGeometry } from "./devices/geometry";
import { parseShowcase } from "./loadConfig";
import {
  isResolvedShowcase,
  type ResolvedClip,
  type ResolvedShowcase,
} from "./probe";
import type { ClipConfig, ShowcaseInput } from "./schema";

const LABEL_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const isResolved = (clip: ClipConfig): clip is ResolvedClip =>
  typeof (clip as ResolvedClip).sourceWidth === "number";

/**
 * Top-level composition. `calculateMetadata` in Root.tsx has already
 * validated the props and resolved each clip against its file. The fallback
 * parse only runs outside that flow (for example in a Player), where clips
 * are sized with a phone aspect and play for the whole body of the video.
 */
export const Showcase: React.FC<ShowcaseInput> = (props) => {
  const config: ResolvedShowcase | ReturnType<typeof parseShowcase> =
    isResolvedShowcase(props) ? props : parseShowcase(props);
  const frame = useCurrentFrame();
  const { width, height, fps, durationInFrames } = useVideoConfig();

  const introFrames = Math.round(config.intro * fps);
  const outroFrames = Math.round(config.outro * fps);
  const bodyFrames = Math.max(1, durationInFrames - introFrames - outroFrames);

  // Each entry in `speeds` is one pass over the clips. Without resolved
  // trims (Player fallback) the body is shared between the passes.
  const speedFactor = config.speeds.reduce((sum, speed) => sum + 1 / speed, 0);
  const clipSeconds = (clip: ClipConfig): number =>
    clip.trimEnd === undefined
      ? bodyFrames / fps / speedFactor
      : clip.trimEnd - clip.trimStart;
  const longestSeconds = Math.max(...config.clips.map(clipSeconds));
  const passes: PlaybackPass[] = [];
  let passStart = introFrames;
  for (const speed of config.speeds) {
    passes.push({ start: passStart, speed });
    passStart += Math.max(1, Math.round((longestSeconds / speed) * fps));
  }

  // Everything scales from the shorter side, so 1080x1920 matches 1920x1080.
  const scale = Math.min(width, height) / 1080;
  const hasLabels = config.clips.some((clip) => clip.label);
  const labelFontSize = 26 * scale;
  const labelBlock = hasLabels ? labelFontSize * 3 : 0;
  const hasTimers = config.clips.some((clip) => clip.timer);
  const timerFontSize = 34 * scale;
  const timerBlock = hasTimers ? timerFontSize * 2.5 : 0;

  // The device fills most of the frame; the remaining margin leaves room for
  // the drop shadow and keeps the phone off the edges of the video.
  const count = config.layout === "sideBySide" ? config.clips.length : 1;
  const gap = count > 1 ? width * 0.05 : 0;
  const maxHeight =
    height * (count > 1 ? 0.84 : 0.88) - labelBlock - timerBlock;
  const maxWidthPerDevice = (width * 0.9 - gap * (count - 1)) / count;

  const clips = config.clips.slice(0, count).map((clip) => {
    const sourceAspect = isResolved(clip)
      ? clip.sourceWidth / clip.sourceHeight
      : 9 / 19.5;
    const bodyAspect = getBodyAspect(clip.device, sourceAspect);
    const bodyHeight = Math.min(maxHeight, maxWidthPerDevice / bodyAspect);
    const geometry = getGeometry(
      clip.device,
      bodyHeight,
      sourceAspect,
      clip.finish,
    );
    return { clip, geometry, seconds: clipSeconds(clip) };
  });

  const opacity = Math.min(
    interpolate(frame, [0, Math.max(1, introFrames)], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    interpolate(
      frame,
      [durationInFrames - Math.max(1, outroFrames), durationInFrames - 1],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );

  return (
    <AbsoluteFill style={{ backgroundColor: config.background }}>
      <AbsoluteFill
        style={{ opacity, alignItems: "center", justifyContent: "center" }}
      >
        {/* Devices sit on a common baseline so captions line up even when
            the phones differ in height. */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            gap,
          }}
        >
          {clips.map(({ clip, geometry, seconds }, index) => (
            <div
              key={`${clip.src}-${index}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: labelFontSize * 1.2,
                justifyContent: "flex-end",
              }}
            >
              {/* Captions share the column; `order` flips them above the phone. */}
              <DeviceFrame
                geometry={geometry}
                shadow={config.shadow}
                scale={scale}
              >
                <ClipVideo clip={clip} passes={passes} clipSeconds={seconds} />
              </DeviceFrame>
              {hasLabels ? (
                <div
                  style={{
                    fontFamily: LABEL_FONT,
                    fontSize: labelFontSize,
                    fontWeight: 500,
                    color: "#111111",
                    letterSpacing: -0.2,
                    textAlign: "center",
                    minHeight: labelFontSize * 1.3,
                    order: config.labelPosition === "above" ? -1 : 1,
                  }}
                >
                  {clip.label ?? ""}
                </div>
              ) : null}
              {hasTimers ? (
                <ClipTimer
                  clip={clip}
                  passes={passes}
                  clipSeconds={seconds}
                  fontSize={timerFontSize}
                />
              ) : null}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
