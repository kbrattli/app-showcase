import type { Device } from "../schema";

/**
 * All device dimensions are expressed relative to the screen width, so the
 * frame scales with the output resolution. Values are tuned to look like a
 * current flagship phone without copying any specific product.
 */
type DeviceSpec = {
  /** Screen width / height. */
  screenAspect: number;
  /** Bezel thickness as a fraction of screen width. */
  bezel: number;
  /** Outer body corner radius as a fraction of screen width. */
  bodyRadius: number;
  /** Dark body color. */
  bodyColor: string;
  /** Thin lighter ring around the body edge. */
  edgeColor: string;
};

const SPECS: Record<Exclude<Device, "none">, DeviceSpec> = {
  iphone: {
    screenAspect: 1170 / 2532,
    bezel: 0.034,
    bodyRadius: 0.15,
    bodyColor: "#0D0D0F",
    edgeColor: "#3B3B40",
  },
  android: {
    screenAspect: 1080 / 2400,
    bezel: 0.032,
    bodyRadius: 0.115,
    bodyColor: "#121214",
    edgeColor: "#34343A",
  },
};

export type DeviceGeometry = {
  device: Device;
  bodyWidth: number;
  bodyHeight: number;
  bodyRadius: number;
  bezel: number;
  edge: number;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
  bodyColor: string;
  edgeColor: string;
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
    edge: Math.max(1, u * 0.006),
    screenWidth: u,
    screenHeight: u / spec.screenAspect,
    screenRadius: Math.max(0, bodyRadius - bezel),
    bodyColor: spec.bodyColor,
    edgeColor: spec.edgeColor,
  };
};
