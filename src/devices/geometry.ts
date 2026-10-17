import type { Device } from "../schema";

/**
 * All device dimensions are expressed relative to the screen width, so the
 * frame scales with the output resolution. Values are tuned to look like a
 * current flagship phone without copying any specific product.
 */
type DeviceSpec = {
  /** Screen width / height. */
  screenAspect: number;
  /** Distance from the outer body edge to the screen, as a fraction of screen width. */
  bezel: number;
  /** Thickness of the metal band at the outside of that bezel, as a fraction of screen width. */
  band: number;
  /** Outer body corner radius as a fraction of screen width. */
  bodyRadius: number;
  /** Near-black glass bezel between the band and the screen. */
  bodyColor: string;
  /** Flat fallback color of the metal band (buttons, antenna lines). */
  edgeColor: string;
  /** Brushed-metal gradient painted on the band. */
  bandGradient: string;
};

const SPECS: Record<Exclude<Device, "none">, DeviceSpec> = {
  iphone: {
    screenAspect: 1206 / 2622,
    bezel: 0.05,
    band: 0.02,
    bodyRadius: 0.17,
    bodyColor: "#060607",
    edgeColor: "#4A4A4F",
    bandGradient:
      "linear-gradient(155deg, #7E7E84 0%, #4F4F55 22%, #343438 48%, #4B4B50 72%, #85858B 100%)",
  },
  android: {
    screenAspect: 1080 / 2424,
    bezel: 0.054,
    band: 0.018,
    bodyRadius: 0.125,
    bodyColor: "#09090B",
    edgeColor: "#3C3C42",
    bandGradient:
      "linear-gradient(155deg, #6B6B71 0%, #3F3F45 25%, #2A2A2F 50%, #3D3D43 75%, #74747A 100%)",
  },
};

export type DeviceGeometry = {
  device: Device;
  bodyWidth: number;
  bodyHeight: number;
  bodyRadius: number;
  bezel: number;
  /** Metal band thickness in px (0 for `none`). */
  edge: number;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  bodyColor: string;
  edgeColor: string;
  bandGradient: string;
};

/** Body width / height for a device, given the recording's own aspect. */
export const getBodyAspect = (device: Device, sourceAspect: number): number => {
  if (device === "none") {
    return sourceAspect;
  }
  const spec = SPECS[device];
  // body = screen + bezel on both sides, in screen-width units
  return (1 + 2 * spec.bezel) / (1 / spec.screenAspect + 2 * spec.bezel);
};

/** Absolute pixel geometry for a device whose body is `bodyHeight` tall. */
export const getGeometry = (
  device: Device,
  bodyHeight: number,
  sourceAspect: number,
): DeviceGeometry => {
  if (device === "none") {
    const bodyWidth = bodyHeight * sourceAspect;
    const radius = Math.min(bodyWidth, bodyHeight) * 0.06;
    return {
      device,
      bodyWidth,
      bodyHeight,
      bodyRadius: radius,
      bezel: 0,
      edge: 0,
      screenWidth: bodyWidth,
      screenHeight: bodyHeight,
      screenRadius: radius,
      bodyColor: "transparent",
      edgeColor: "transparent",
      bandGradient: "none",
    };
  }

  const spec = SPECS[device];
  // Solve for the screen width u: bodyHeight = u / screenAspect + 2 * bezel * u
  const u = bodyHeight / (1 / spec.screenAspect + 2 * spec.bezel);
  const bezel = u * spec.bezel;
  const bodyRadius = u * spec.bodyRadius;

  return {
    device,
    bodyWidth: u + 2 * bezel,
    bodyHeight,
    bodyRadius,
    bezel,
    edge: Math.max(1.5, u * spec.band),
    screenWidth: u,
    screenHeight: u / spec.screenAspect,
    screenRadius: Math.max(0, bodyRadius - bezel),
    bodyColor: spec.bodyColor,
    edgeColor: spec.edgeColor,
    bandGradient: spec.bandGradient,
  };
};
