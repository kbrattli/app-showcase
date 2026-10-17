import { useId } from "react";
import type { Finish } from "./finishes";
import { superellipsePath, type DeviceGeometry } from "./geometry";

type Props = {
  readonly g: DeviceGeometry;
};

/**
 * Draws a phone as vector art on top of the screen: metal band with rim
 * light and antenna breaks, near-black glass with a chamfer where it meets
 * the band, the screen cut out with a mask so the video underneath shows
 * through, and the Dynamic Island or punch-hole camera over the video.
 * Gradients only, no SVG filters, so each frame rasterises cheaply.
 */
export const PhoneSvg: React.FC<Props> = ({ g }) => {
  const uid = useId().replace(/:/g, "");
  const model = g.model;
  const finish = g.finish;
  if (!model || !finish) {
    return null;
  }

  const id = (name: string) => `${uid}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  const n = g.cornerExponent;
  const band = g.band;
  const line = Math.max(1, band * 0.18);

  const bodyPath = superellipsePath(
    0,
    0,
    g.bodyWidth,
    g.bodyHeight,
    g.bodyRadius,
    n,
  );
  const rimWidth = Math.max(1, band * 0.5);
  const rimPath = superellipsePath(
    rimWidth / 2,
    rimWidth / 2,
    g.bodyWidth - rimWidth,
    g.bodyHeight - rimWidth,
    g.bodyRadius - rimWidth / 2,
    n,
  );
  const glassPath = superellipsePath(
    band,
    band,
    g.bodyWidth - 2 * band,
    g.bodyHeight - 2 * band,
    g.bodyRadius - band,
    n,
  );
  // Dark gap just inside the band, where the glass drops below the rim.
  const gapWidth = Math.max(1, band * 0.6);
  const gapPath = superellipsePath(
    band + gapWidth / 2,
    band + gapWidth / 2,
    g.bodyWidth - 2 * band - gapWidth,
    g.bodyHeight - 2 * band - gapWidth,
    g.bodyRadius - band - gapWidth / 2,
    n,
  );
  const screenPath = superellipsePath(
    g.bezelX,
    g.bezelY,
    g.screenWidth,
    g.screenHeight,
    g.screenRadius,
    n,
  );

  return (
    <svg
      width={g.bodyWidth}
      height={g.bodyHeight}
      viewBox={`0 0 ${g.bodyWidth} ${g.bodyHeight}`}
      style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}
    >
      <defs>
        {/* Band lit from the top-left. */}
        <linearGradient id={id("band")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={finish.bandHi} />
          <stop offset="0.5" stopColor={finish.bandMid} />
          <stop offset="1" stopColor={finish.bandLo} />
        </linearGradient>
        {/* Specular rim: bright along the top edge, dark along the bottom. */}
        <linearGradient id={id("rim")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={finish.rim} />
          <stop offset="0.3" stopColor="rgba(255,255,255,0)" />
          <stop offset="0.7" stopColor="rgba(0,0,0,0)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.5)" />
        </linearGradient>
        <linearGradient id={id("buttonLeft")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={finish.buttonHi} />
          <stop offset="1" stopColor={finish.buttonLo} />
        </linearGradient>
        <linearGradient id={id("buttonRight")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={finish.buttonLo} />
          <stop offset="1" stopColor={finish.buttonHi} />
        </linearGradient>
        {/* Faint diagonal reflection on the cover glass. */}
        <linearGradient id={id("sheen")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.07)" />
          <stop offset="0.28" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="0.42" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
        <radialGradient id={id("lens")} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#26303A" />
          <stop offset="0.55" stopColor="#0E1216" />
          <stop offset="1" stopColor="#000000" />
        </radialGradient>
        <radialGradient id={id("punch")} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#1E262E" />
          <stop offset="0.5" stopColor="#0A0D10" />
          <stop offset="1" stopColor="#000000" />
        </radialGradient>
        {/* Everything inside the screen outline is cut away. */}
        <mask id={id("screen")}>
          <rect
            x={-g.bodyWidth}
            y={-g.bodyHeight}
            width={g.bodyWidth * 3}
            height={g.bodyHeight * 3}
            fill="#FFFFFF"
          />
          <path d={screenPath} fill="#000000" />
        </mask>
      </defs>

      {/* Buttons first, so the body covers the part that sits inside it. */}
      <Buttons g={g} finish={finish} url={url} />

      <g mask={url("screen")}>
        <path d={bodyPath} fill={url("band")} />
        <path
          d={rimPath}
          fill="none"
          stroke={url("rim")}
          strokeWidth={rimWidth}
        />
        <AntennaLines g={g} finish={finish} line={line} />
        {/* Glass, with a dark gap and a thin light chamfer at the band. */}
        <path d={glassPath} fill={model.glassColor} />
        <path
          d={gapPath}
          fill="none"
          stroke="rgba(0,0,0,0.75)"
          strokeWidth={gapWidth}
        />
        <path
          d={glassPath}
          fill="none"
          stroke={finish.chamfer}
          strokeWidth={line}
        />
        <path
          d={screenPath}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={Math.max(1, line)}
        />
      </g>

      {/* Over the video: reflection and the camera cut-out. */}
      <path d={screenPath} fill={url("sheen")} />
      <Cutout g={g} url={url} />
    </svg>
  );
};

type LayerProps = {
  readonly g: DeviceGeometry;
  readonly finish: Finish;
  readonly url: (name: string) => string;
};

const Buttons: React.FC<LayerProps> = ({ g, finish, url }) => {
  const model = g.model;
  if (!model) {
    return null;
  }
  const thickness = Math.max(2, g.screenWidth * 0.011);
  const protrude = thickness * 0.65;
  return (
    <>
      {model.buttons.map((button, index) => {
        const recessed = button.kind === "cameraControl";
        const out = recessed ? protrude * 0.35 : protrude;
        const x = button.side === "left" ? -out : g.bodyWidth + out - thickness;
        const y = g.bodyHeight * button.top;
        const height = g.screenWidth * button.length;
        return (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={thickness}
              height={height}
              rx={thickness * 0.4}
              fill={
                recessed
                  ? finish.bandLo
                  : url(button.side === "left" ? "buttonLeft" : "buttonRight")
              }
            />
            {/* Light catches the top end of each button. */}
            <rect
              x={x + thickness * 0.2}
              y={y}
              width={thickness * 0.6}
              height={Math.max(1, thickness * 0.3)}
              rx={thickness * 0.15}
              fill={finish.rim}
            />
          </g>
        );
      })}
    </>
  );
};

const AntennaLines: React.FC<
  Omit<LayerProps, "url"> & { readonly line: number }
> = ({ g, finish, line }) => {
  const model = g.model;
  if (!model) {
    return null;
  }
  return (
    <>
      {model.antennaLines.flatMap((position) =>
        (["left", "right"] as const).map((side) => {
          const y = g.bodyHeight * position - line / 2;
          const x = side === "left" ? 0 : g.bodyWidth - g.band;
          return (
            <g key={`${side}-${position}`}>
              <rect
                x={x}
                y={y}
                width={g.band}
                height={line}
                fill="rgba(28,28,32,0.95)"
              />
              <rect
                x={x}
                y={y + line}
                width={g.band}
                height={Math.max(0.5, line * 0.5)}
                fill={finish.rim}
                opacity={0.35}
              />
            </g>
          );
        }),
      )}
    </>
  );
};

const Cutout: React.FC<Omit<LayerProps, "finish">> = ({ g, url }) => {
  const model = g.model;
  if (!model) {
    return null;
  }
  const u = g.screenWidth;
  const cutout = model.cutout;

  if (cutout.kind === "island") {
    const width = u * cutout.width;
    const height = u * cutout.height;
    const x = g.bezelX + (u - width) / 2;
    const y = g.bezelY + u * cutout.top;
    const lens = u * 0.055;
    const cx = x + width - height * 0.3 - lens / 2;
    const cy = y + height / 2;
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={height / 2}
          fill="#000000"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={1}
        />
        <circle cx={cx} cy={cy} r={lens / 2} fill={url("lens")} />
        <circle
          cx={cx}
          cy={cy}
          r={lens / 2}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={lens * 0.3}
          fill="#0B0F13"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={1}
        />
      </g>
    );
  }

  const size = u * cutout.size;
  const cx = g.bezelX + u / 2;
  const cy = g.bezelY + u * cutout.top + size / 2;
  return (
    <g>
      <circle cx={cx} cy={cy} r={size / 2} fill={url("punch")} />
      <circle
        cx={cx}
        cy={cy}
        r={size / 2 - Math.max(1, size * 0.08) / 2}
        fill="none"
        stroke="#1A1B1F"
        strokeWidth={Math.max(1, size * 0.08)}
      />
      <circle
        cx={cx}
        cy={cy}
        r={size / 2}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth={1}
      />
    </g>
  );
};
