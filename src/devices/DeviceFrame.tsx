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
 * A phone drawn entirely with CSS: rounded body, thin bezel, side buttons and
 * a dynamic island (iphone) or hole punch (android). `children` is rendered
 * inside the screen area, clipped to its rounded corners.
 */
export const DeviceFrame: React.FC<Props> = ({
  geometry: g,
  shadow,
  scale,
  children,
}) => {
  const dropShadow = shadow.enabled
    ? `0 ${shadow.offsetY * scale}px ${shadow.blur * scale}px rgba(0, 0, 0, ${shadow.opacity})`
    : null;
  const edgeRing = g.edge > 0 ? `inset 0 0 0 ${g.edge}px ${g.edgeColor}` : null;
  const boxShadow =
    [edgeRing, dropShadow].filter(Boolean).join(", ") || undefined;

  return (
    <div
      style={{
        position: "relative",
        width: g.bodyWidth,
        height: g.bodyHeight,
        borderRadius: g.bodyRadius,
        backgroundColor: g.bodyColor,
        boxShadow,
      }}
    >
      {g.device === "iphone" ? <IphoneButtons g={g} /> : null}
      {g.device === "android" ? <AndroidButtons g={g} /> : null}
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
        {g.device === "iphone" ? <DynamicIsland g={g} /> : null}
        {g.device === "android" ? <HolePunch g={g} /> : null}
      </div>
    </div>
  );
};

const DynamicIsland: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => {
  const width = g.screenWidth * 0.31;
  const height = g.screenWidth * 0.092;
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
      }}
    />
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
        backgroundColor: "#000000",
        boxShadow: `inset 0 0 0 ${Math.max(1, size * 0.08)}px #1C1C20`,
      }}
    />
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
  const thickness = Math.max(2, g.screenWidth * 0.013);
  return (
    <div
      style={{
        position: "absolute",
        top: g.bodyHeight * top,
        height: g.screenWidth * length,
        width: thickness,
        [side]: -thickness + Math.max(1, thickness * 0.15),
        borderRadius: thickness,
        backgroundColor: g.edgeColor,
        boxShadow: `inset 0 0 0 ${Math.max(0.5, thickness * 0.2)}px rgba(255,255,255,0.08)`,
      }}
    />
  );
};

const IphoneButtons: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => (
  <>
    <SideButton g={g} side="left" top={0.17} length={0.07} />
    <SideButton g={g} side="left" top={0.245} length={0.14} />
    <SideButton g={g} side="left" top={0.325} length={0.14} />
    <SideButton g={g} side="right" top={0.27} length={0.22} />
  </>
);

const AndroidButtons: React.FC<{ readonly g: DeviceGeometry }> = ({ g }) => (
  <>
    <SideButton g={g} side="right" top={0.2} length={0.11} />
    <SideButton g={g} side="right" top={0.27} length={0.2} />
  </>
);
