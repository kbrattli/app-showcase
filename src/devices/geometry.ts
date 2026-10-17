import { FINISHES, type Finish } from "./finishes";
import { resolveModel, type DeviceModel } from "./models";

/**
 * Pixel geometry of a device frame. Every value is derived from the model's
 * millimetre sizes and the body height the layout gives it, so the frame
 * scales with the output resolution. No fixed pixel sizes anywhere.
 */
export type DeviceGeometry = {
  /** null for `none`. */
  model: DeviceModel | null;
  /** null for `none`. */
  finish: Finish | null;
  bodyWidth: number;
  bodyHeight: number;
  bodyRadius: number;
  /** Superellipse exponent of the body and screen corners (2 = circular). */
  cornerExponent: number;
  /** Body edge to screen edge, horizontally and vertically. */
  bezelX: number;
  bezelY: number;
  /** Metal rim thickness in px (0 for `none`). */
  band: number;
  screenWidth: number;
  screenHeight: number;
  screenRadius: number;
};

/** Screen width in mm from the diagonal and the pixel aspect. */
const screenWidthMm = (model: DeviceModel): number => {
  const ratio = model.screenPx.h / model.screenPx.w;
  return (model.screenDiagonalIn * 25.4) / Math.sqrt(1 + ratio * ratio);
};

/** Body width / height for a device, given the recording's own aspect. */
export const getBodyAspect = (device: string, sourceAspect: number): number => {
  const model = resolveModel(device);
  if (!model) {
    return sourceAspect;
  }
  const w = screenWidthMm(model);
  const h = (w * model.screenPx.h) / model.screenPx.w;
  return (w + 2 * model.bezelMm.side) / (h + 2 * model.bezelMm.top);
};

/** Names a finish of a model, or the model's default. Throws on an unknown one. */
export const resolveFinish = (model: DeviceModel, finish?: string): Finish => {
  const name = finish ?? model.defaultFinish;
  const id = model.finishes[name];
  if (!id) {
    throw new Error(
      `finish "${name}" does not exist for ${model.label}. ` +
        `Choose one of: ${Object.keys(model.finishes).join(", ")}.`,
    );
  }
  return FINISHES[id];
};

/** Absolute pixel geometry for a device whose body is `bodyHeight` tall. */
export const getGeometry = (
  device: string,
  bodyHeight: number,
  sourceAspect: number,
  finish?: string,
): DeviceGeometry => {
  const model = resolveModel(device);
  if (!model) {
    const bodyWidth = bodyHeight * sourceAspect;
    const radius = Math.min(bodyWidth, bodyHeight) * 0.06;
    return {
      model: null,
      finish: null,
      bodyWidth,
      bodyHeight,
      bodyRadius: radius,
      cornerExponent: 2,
      bezelX: 0,
      bezelY: 0,
      band: 0,
      screenWidth: bodyWidth,
      screenHeight: bodyHeight,
      screenRadius: radius,
    };
  }

  const wMm = screenWidthMm(model);
  const hMm = (wMm * model.screenPx.h) / model.screenPx.w;
  const bodyHeightMm = hMm + 2 * model.bezelMm.top;
  const px = bodyHeight / bodyHeightMm; // pixels per millimetre

  const bezelX = model.bezelMm.side * px;
  const bezelY = model.bezelMm.top * px;
  const bodyRadius = model.bodyRadiusMm * px;

  return {
    model,
    finish: resolveFinish(model, finish),
    bodyWidth: (wMm + 2 * model.bezelMm.side) * px,
    bodyHeight,
    bodyRadius,
    cornerExponent: model.cornerExponent,
    bezelX,
    bezelY,
    band: Math.max(1.5, model.bandMm * px),
    screenWidth: wMm * px,
    screenHeight: hMm * px,
    // Concentric with the body, so the glass border is even all the way round.
    screenRadius: Math.max(0, bodyRadius - Math.min(bezelX, bezelY)),
  };
};

/**
 * SVG path of a rounded rectangle whose corners follow a superellipse
 * (|x/r|^n + |y/r|^n = 1). n = 2 gives circular corners; iPhones use about
 * 4, which is the "continuous" corner that plain border-radius cannot draw.
 * The path starts at (x, y) and is closed.
 */
export const superellipsePath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  exponent: number,
  samples = 16,
): string => {
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const n = Math.max(1, exponent);
  const right = x + width;
  const bottom = y + height;

  // One quarter of the superellipse from angle 0 to 90°, as offsets in [0, r].
  const quarter: Array<[number, number]> = [];
  for (let i = 0; i <= samples; i++) {
    const t = (i / samples) * (Math.PI / 2);
    const c = Math.cos(t);
    const s = Math.sin(t);
    quarter.push([
      r * Math.sign(c) * Math.pow(Math.abs(c), 2 / n),
      r * Math.sign(s) * Math.pow(Math.abs(s), 2 / n),
    ]);
  }

  const f = (v: number) => Number(v.toFixed(2));
  const parts: string[] = [];
  // Top-right corner: from (right - r, y) around to (right, y + r).
  parts.push(`M ${f(x + r)} ${f(y)}`);
  parts.push(`L ${f(right - r)} ${f(y)}`);
  for (const [cx, cy] of quarter) {
    parts.push(`L ${f(right - r + cy)} ${f(y + r - cx)}`);
  }
  // Bottom-right.
  parts.push(`L ${f(right)} ${f(bottom - r)}`);
  for (const [cx, cy] of quarter) {
    parts.push(`L ${f(right - r + cx)} ${f(bottom - r + cy)}`);
  }
  // Bottom-left.
  parts.push(`L ${f(x + r)} ${f(bottom)}`);
  for (const [cx, cy] of quarter) {
    parts.push(`L ${f(x + r - cy)} ${f(bottom - r + cx)}`);
  }
  // Top-left.
  parts.push(`L ${f(x)} ${f(y + r)}`);
  for (const [cx, cy] of quarter) {
    parts.push(`L ${f(x + r - cx)} ${f(y + r - cy)}`);
  }
  parts.push("Z");
  return parts.join(" ");
};
