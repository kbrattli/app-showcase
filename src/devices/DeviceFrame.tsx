import type { ShowcaseConfig } from "../schema";
import type { DeviceGeometry } from "./geometry";

type Props = {
  readonly geometry: DeviceGeometry;
  readonly shadow: ShowcaseConfig["shadow"];
  /** Multiplier applied to the 1080p shadow values. */
  readonly scale: number;
  readonly children: React.ReactNode;
};

/**
 * A phone drawn entirely with CSS, in three layers from the outside in:
 * a brushed-metal band with antenna lines and side buttons, a near-black
 * glass bezel, and the screen with a dynamic island (iphone) or hole punch
 * (android). `children` is rendered inside the screen area, clipped to its
 * rounded corners.
 */
export const DeviceFrame: React.FC<Props> = ({
  geometry: g,
  shadow,
  scale,
  children,
}) => {
  const isPhone = g.device !== "none";

  // Two shadow layers read as a real object: a wide ambient shadow (the
  // configured one) plus a tight contact shadow right under the body.
  const dropShadow = shadow.enabled
    ? [
        `0 ${shadow.offsetY * scale}px ${shadow.blur * scale}px rgba(0, 0, 0, ${shadow.opacity})`,
        `0 ${shadow.offsetY * 0.2 * scale}px ${Math.max(2, shadow.blur * 0.25 * scale)}px rgba(0, 0, 0, ${shadow.opacity * 0.7})`,
      ]
    : [];

  // Specular highlight along the top of the band and a darker line at the bottom.
  const bandLighting = isPhone
    ? [
        `inset 0 1px 0 rgba(255, 255, 255, 0.35)`,
        `inset 0 -1px 0 rgba(0, 0, 0, 0.45)`,
      ]
    : [];

  const boxShadow = [...bandLighting, ...dropShadow].join(", ") || undefined;

  return (
    <div
      style={{
        position: "relative",
        width: g.bodyWidth,
        height: g.bodyHeight,
        borderRadius: g.bodyRadius,
        background: isPhone ? g.bandGradient : g.bodyColor,
        boxShadow,
      }}
    >
      {g.device === "iphone" ? <IphoneButtons g={g} /> : null}
      {g.device === "android" ? <AndroidButtons g={g} /> : null}
      {isPhone ? <AntennaLines g={g} /> : null}
      {isPhone ? (
        // Glass bezel: sits inside the band, slightly darker at the band edge.
        <div
          style={{
            position: "absolute",
            inset: g.edge,
            borderRadius: Math.max(0, g.bodyRadius - g.edge),
            backgroundColor: g.bodyColor,
            boxShadow: `inset 0 0 0 1px rgba(0, 0, 0, 0.7), inset 0 0 ${g.edge * 2}px rgba(0, 0, 0, 0.6)`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          inset: g.bezel,
          borderRadius: g.screenRadius,
          overflow: "hidden",
          backgroundColor: "#000000",
          // Promote to its own layer so the rounded clip applies to the video.
          isolation: "isolate",
          transform: "translateZ(0)",
        }}
      >
        {children}
        {isPhone ? (
          // Faint edge of the cover glass over the screen.
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: g.screenRadius,
              boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
              pointerEvents: "none",
            }}
          />
        ) : null}
        {g.device === "iphone" ? <DynamicIsland g={g} /> : null}
        {g.device === "android" ? <HolePunch g={g} /> : null}
      </div>
    </div>
  );
};

const DynamicIsland: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => {
  const width = g.screenWidth * 0.31;
  const height = g.screenWidth * 0.092;
  const lens = height * 0.5;
  return (
    <div
      style={{
        position: "absolute",
        top: g.screenWidth * 0.028,
        left: (g.screenWidth - width) / 2,
        width,
        height,
        borderRadius: height / 2,
        backgroundColor: "#000000",
        boxShadow: "0 0 0 0.5px rgba(255, 255, 255, 0.06)",
      }}
    >
      {/* Front camera lens, right end of the island. */}
      <div
        style={{
          position: "absolute",
          top: (height - lens) / 2,
          right: height * 0.3,
          width: lens,
          height: lens,
          borderRadius: lens / 2,
          background:
            "radial-gradient(circle at 35% 35%, #26303A 0%, #0E1216 55%, #000000 100%)",
          boxShadow: "inset 0 0 0 0.5px rgba(255, 255, 255, 0.1)",
        }}
      />
    </div>
  );
};

const HolePunch: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => {
  const size = g.screenWidth * 0.052;
  return (
    <div
      style={{
        position: "absolute",
        top: g.screenWidth * 0.026,
        left: (g.screenWidth - size) / 2,
        width: size,
        height: size,
        borderRadius: size / 2,
        background:
          "radial-gradient(circle at 35% 35%, #1E262E 0%, #0A0D10 50%, #000000 100%)",
        boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.08)}px #141418, 0 0 0 0.5px rgba(255, 255, 255, 0.08)`,
      }}
    />
  );
};

/**
 * The thin breaks in the metal band where the antennas sit: two on each
 * side, near the top and bottom corners.
 */
const AntennaLines: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => {
  const thickness = Math.max(1, g.edge * 0.35);
  const positions = [0.1, 0.9];
  return (
    <>
      {positions.flatMap((top) =>
        (["left", "right"] as const).map((side) => (
          <div
            key={`${side}-${top}`}
            style={{
              position: "absolute",
              top: g.bodyHeight * top - thickness / 2,
              [side]: 0,
              width: g.edge,
              height: thickness,
              backgroundColor: "rgba(20, 20, 24, 0.9)",
              boxShadow: "0 0.5px 0 rgba(255, 255, 255, 0.18)",
            }}
          />
        )),
      )}
    </>
  );
};

type ButtonProps = {
  readonly g: DeviceGeometry;
  readonly side: "left" | "right";
  /** Top position as a fraction of body height. */
  readonly top: number;
  /** Length as a fraction of screen width. */
  readonly length: number;
};

const SideButton: React.FC<ButtonProps> = ({ g, side, top, length }) => {
  const thickness = Math.max(2, g.screenWidth * 0.014);
  const protrude = thickness * 0.8;
  // Light falls from the top-left, so the two sides shade differently.
  const gradient =
    side === "left"
      ? "linear-gradient(90deg, #8A8A90 0%, #5A5A60 45%, #3A3A3F 100%)"
      : "linear-gradient(90deg, #3A3A3F 0%, #5A5A60 55%, #7A7A80 100%)";
  return (
    <div
      style={{
        position: "absolute",
        top: g.bodyHeight * top,
        height: g.screenWidth * length,
        width: thickness,
        [side]: -protrude,
        borderRadius: thickness * 0.4,
        background: gradient,
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.5)",
      }}
    />
  );
};

const IphoneButtons: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => (
  <>
    {/* Action button, volume up, volume down. */}
    <SideButton g={g} side="left" top={0.165} length={0.065} />
    <SideButton g={g} side="left" top={0.235} length={0.13} />
    <SideButton g={g} side="left" top={0.31} length={0.13} />
    {/* Side button and camera control. */}
    <SideButton g={g} side="right" top={0.26} length={0.21} />
    <SideButton g={g} side="right" top={0.585} length={0.1} />
  </>
);

const AndroidButtons: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => (
  <>
    <SideButton g={g} side="right" top={0.19} length={0.1} />
    <SideButton g={g} side="right" top={0.26} length={0.2} />
  </>
);
