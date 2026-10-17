import type { ShowcaseConfig } from "../schema";
import { superellipsePath, type DeviceGeometry } from "./geometry";
import { PhoneSvg } from "./PhoneSvg";

type Props = {
  readonly geometry: DeviceGeometry;
  readonly shadow: ShowcaseConfig["shadow"];
  /** Multiplier applied to the 1080p shadow values. */
  readonly scale: number;
  readonly children: React.ReactNode;
};

/** Three shadow layers: a wide ambient one (the configured values), a tighter
 * one under the body and a thin contact line, so the phone reads as an object. */
const dropShadow = (
  shadow: ShowcaseConfig["shadow"],
  scale: number,
): string | undefined =>
  shadow.enabled
    ? [
        `0 ${shadow.offsetY * scale}px ${shadow.blur * scale}px rgba(0, 0, 0, ${shadow.opacity})`,
        `0 ${shadow.offsetY * 0.2 * scale}px ${Math.max(2, shadow.blur * 0.25 * scale)}px rgba(0, 0, 0, ${shadow.opacity * 0.7})`,
        `0 ${Math.max(1, scale)}px ${Math.max(2, 2 * scale)}px rgba(0, 0, 0, ${Math.min(1, shadow.opacity * 1.4)})`,
      ].join(", ")
    : undefined;

/**
 * A phone around the recording: a drop shadow underneath, the screen (an
 * HTML element holding the video, clipped to the screen outline) and the
 * vector phone drawn on top with the screen cut out. For `none` only the
 * rounded clip and the shadow remain.
 */
export const DeviceFrame: React.FC<Props> = ({
  geometry: g,
  shadow,
  scale,
  children,
}) => {
  const boxShadow = dropShadow(shadow, scale);

  if (!g.model) {
    return (
      <div
        style={{
          position: "relative",
          width: g.bodyWidth,
          height: g.bodyHeight,
          borderRadius: g.bodyRadius,
          overflow: "hidden",
          backgroundColor: "#000000",
          boxShadow,
          // Promote to its own layer so the rounded clip applies to the video.
          isolation: "isolate",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </div>
    );
  }

  const screenClip = superellipsePath(
    0,
    0,
    g.screenWidth,
    g.screenHeight,
    g.screenRadius,
    g.cornerExponent,
  );

  return (
    <div
      style={{ position: "relative", width: g.bodyWidth, height: g.bodyHeight }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: g.bodyRadius,
          boxShadow,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: g.bezelX,
          top: g.bezelY,
          width: g.screenWidth,
          height: g.screenHeight,
          overflow: "hidden",
          backgroundColor: "#000000",
          clipPath: `path("${screenClip}")`,
          isolation: "isolate",
          transform: "translateZ(0)",
        }}
      >
        {children}
      </div>
      <PhoneSvg g={g} />
    </div>
  );
};
