import type { FinishId } from "./finishes";

/**
 * Catalogue of phone models the renderer can draw. Physical sizes are in
 * millimetres from the manufacturers' spec sheets; everything is converted
 * to fractions of the screen width in geometry.ts, so a model scales with
 * the output resolution. Bezel widths are derived from body minus screen and
 * tuned by eye against product photos.
 */
export const DEVICE_IDS = [
  "iphone-17-pro",
  "iphone-17",
  "iphone-16-pro",
  "iphone-16",
  "iphone-15-pro",
  "pixel-10-pro",
  "pixel-9-pro",
  "galaxy-s25",
  "galaxy-s25-ultra",
] as const;

export type DeviceId = (typeof DEVICE_IDS)[number];

/** Short names that always point at the newest model of each family. */
export const DEVICE_ALIASES = {
  iphone: "iphone-17-pro",
  android: "pixel-10-pro",
} as const satisfies Record<string, DeviceId>;

export type DeviceAlias = keyof typeof DEVICE_ALIASES;

export type ButtonSpec = {
  side: "left" | "right";
  /** Top edge as a fraction of body height. */
  top: number;
  /** Length as a fraction of screen width. */
  length: number;
  /** Camera Control sits flush and darker than a regular button. */
  kind?: "button" | "cameraControl";
};

export type CutoutSpec =
  | {
      kind: "island";
      /** Pill size as fractions of screen width. */
      width: number;
      height: number;
      /** Distance from the top of the screen, fraction of screen width. */
      top: number;
    }
  | {
      kind: "punch";
      /** Diameter as a fraction of screen width. */
      size: number;
      top: number;
    };

export type DeviceModel = {
  id: DeviceId;
  family: "iphone" | "pixel" | "galaxy";
  label: string;
  bodyMm: { w: number; h: number };
  screenPx: { w: number; h: number };
  screenDiagonalIn: number;
  /** Body edge to screen edge, in mm. */
  bezelMm: { side: number; top: number };
  /** Metal rim visible from the front, in mm. */
  bandMm: number;
  bodyRadiusMm: number;
  /** Superellipse exponent: 2 = circular corners, higher = squarer "squircle". */
  cornerExponent: number;
  /** Near-black glass around the screen. */
  glassColor: string;
  cutout: CutoutSpec;
  buttons: ButtonSpec[];
  /** Antenna breaks in the band, as fractions of body height. */
  antennaLines: number[];
  /** finish name as written in showcase.json -> palette id. */
  finishes: Record<string, FinishId>;
  defaultFinish: string;
};

// iPhone 15 Pro: Action button and volume on the left, side button only on the right.
const IPHONE_15_BUTTONS: ButtonSpec[] = [
  { side: "left", top: 0.185, length: 0.105 },
  { side: "left", top: 0.25, length: 0.18 },
  { side: "left", top: 0.345, length: 0.18 },
  { side: "right", top: 0.275, length: 0.27 },
];

const IPHONE_BUTTONS: ButtonSpec[] = [
  { side: "left", top: 0.185, length: 0.105 }, // Action button
  { side: "left", top: 0.25, length: 0.18 }, // Volume up
  { side: "left", top: 0.345, length: 0.18 }, // Volume down
  { side: "right", top: 0.275, length: 0.27 }, // Side button
  { side: "right", top: 0.63, length: 0.165, kind: "cameraControl" },
];

const PIXEL_BUTTONS: ButtonSpec[] = [
  { side: "right", top: 0.235, length: 0.15 }, // Power
  { side: "right", top: 0.345, length: 0.36 }, // Volume rocker
];

const GALAXY_BUTTONS: ButtonSpec[] = [
  { side: "right", top: 0.2, length: 0.3 }, // Volume rocker
  { side: "right", top: 0.36, length: 0.14 }, // Side key
];

const ISLAND: CutoutSpec = {
  kind: "island",
  width: 0.318,
  height: 0.094,
  top: 0.028,
};
const PIXEL_PUNCH: CutoutSpec = { kind: "punch", size: 0.055, top: 0.032 };
const GALAXY_PUNCH: CutoutSpec = { kind: "punch", size: 0.042, top: 0.026 };

const iphone = (
  id: DeviceId,
  label: string,
  body: { w: number; h: number },
  screen: { w: number; h: number; in: number },
  bezel: { side: number; top: number },
  bodyRadiusMm: number,
  finishes: Record<string, FinishId>,
  defaultFinish: string,
): DeviceModel => ({
  id,
  family: "iphone",
  label,
  bodyMm: body,
  screenPx: { w: screen.w, h: screen.h },
  screenDiagonalIn: screen.in,
  bezelMm: bezel,
  bandMm: 1.3,
  bodyRadiusMm,
  cornerExponent: 2.6,
  glassColor: "#060607",
  cutout: ISLAND,
  buttons: IPHONE_BUTTONS,
  antennaLines: [0.085, 0.915],
  finishes,
  defaultFinish,
});

export const MODELS: Record<DeviceId, DeviceModel> = {
  "iphone-17-pro": iphone(
    "iphone-17-pro",
    "iPhone 17 Pro",
    { w: 71.9, h: 150.0 },
    { w: 1206, h: 2622, in: 6.3 },
    { side: 2.3, top: 2.1 },
    12.6,
    {
      silver: "aluminium-silver",
      "cosmic-orange": "aluminium-cosmic-orange",
      "deep-blue": "aluminium-deep-blue",
    },
    "silver",
  ),
  "iphone-17": iphone(
    "iphone-17",
    "iPhone 17",
    { w: 71.5, h: 149.6 },
    { w: 1206, h: 2622, in: 6.3 },
    { side: 2.3, top: 2.1 },
    12.6,
    {
      black: "aluminium-black",
      white: "aluminium-white",
      sage: "aluminium-sage",
      lavender: "aluminium-lavender",
      "mist-blue": "aluminium-mist-blue",
    },
    "black",
  ),
  "iphone-16-pro": iphone(
    "iphone-16-pro",
    "iPhone 16 Pro",
    { w: 71.5, h: 149.6 },
    { w: 1206, h: 2622, in: 6.3 },
    { side: 2.3, top: 2.1 },
    12.6,
    {
      natural: "titanium-natural",
      black: "titanium-black",
      white: "titanium-white",
      desert: "titanium-desert",
    },
    "natural",
  ),
  "iphone-16": iphone(
    "iphone-16",
    "iPhone 16",
    { w: 71.6, h: 147.6 },
    { w: 1179, h: 2556, in: 6.1 },
    { side: 3.3, top: 3.5 },
    13.2,
    {
      black: "aluminium-black",
      white: "aluminium-white",
      pink: "aluminium-pink",
      teal: "aluminium-teal",
      ultramarine: "aluminium-ultramarine",
    },
    "black",
  ),
  "iphone-15-pro": {
    ...iphone(
      "iphone-15-pro",
      "iPhone 15 Pro",
      { w: 70.6, h: 146.6 },
      { w: 1179, h: 2556, in: 6.1 },
      { side: 2.85, top: 2.95 },
      12.6,
      {
        natural: "titanium-natural",
        blue: "titanium-blue",
        white: "titanium-white",
        black: "titanium-black",
      },
      "natural",
    ),
    buttons: IPHONE_15_BUTTONS,
  },
  "pixel-10-pro": {
    id: "pixel-10-pro",
    family: "pixel",
    label: "Pixel 10 Pro",
    bodyMm: { w: 72.0, h: 152.8 },
    screenPx: { w: 1280, h: 2856 },
    screenDiagonalIn: 6.3,
    bezelMm: { side: 3.3, top: 3.4 },
    bandMm: 1.2,
    bodyRadiusMm: 10.0,
    cornerExponent: 2.4,
    glassColor: "#09090B",
    cutout: PIXEL_PUNCH,
    buttons: PIXEL_BUTTONS,
    antennaLines: [0.07, 0.93],
    finishes: {
      obsidian: "pixel-obsidian",
      porcelain: "pixel-porcelain",
      moonstone: "pixel-moonstone",
      jade: "pixel-jade",
    },
    defaultFinish: "obsidian",
  },
  "pixel-9-pro": {
    id: "pixel-9-pro",
    family: "pixel",
    label: "Pixel 9 Pro",
    bodyMm: { w: 72.0, h: 152.8 },
    screenPx: { w: 1280, h: 2856 },
    screenDiagonalIn: 6.3,
    bezelMm: { side: 3.3, top: 3.4 },
    bandMm: 1.2,
    bodyRadiusMm: 10.0,
    cornerExponent: 2.4,
    glassColor: "#09090B",
    cutout: PIXEL_PUNCH,
    buttons: PIXEL_BUTTONS,
    antennaLines: [0.07, 0.93],
    finishes: {
      obsidian: "pixel-obsidian",
      porcelain: "pixel-porcelain",
      hazel: "pixel-hazel",
      "rose-quartz": "pixel-rose-quartz",
    },
    defaultFinish: "obsidian",
  },
  "galaxy-s25": {
    id: "galaxy-s25",
    family: "galaxy",
    label: "Galaxy S25",
    bodyMm: { w: 70.5, h: 146.9 },
    screenPx: { w: 1080, h: 2340 },
    screenDiagonalIn: 6.2,
    bezelMm: { side: 2.4, top: 2.2 },
    bandMm: 1.1,
    bodyRadiusMm: 8.0,
    cornerExponent: 2.3,
    glassColor: "#09090B",
    cutout: GALAXY_PUNCH,
    buttons: GALAXY_BUTTONS,
    antennaLines: [0.08, 0.92],
    finishes: {
      navy: "galaxy-navy",
      "icy-blue": "galaxy-icy-blue",
      mint: "galaxy-mint",
      "silver-shadow": "galaxy-silver-shadow",
    },
    defaultFinish: "navy",
  },
  "galaxy-s25-ultra": {
    id: "galaxy-s25-ultra",
    family: "galaxy",
    label: "Galaxy S25 Ultra",
    bodyMm: { w: 77.6, h: 162.8 },
    screenPx: { w: 1440, h: 3120 },
    screenDiagonalIn: 6.9,
    bezelMm: { side: 2.2, top: 2.0 },
    bandMm: 1.1,
    bodyRadiusMm: 4.0,
    cornerExponent: 2.0,
    glassColor: "#09090B",
    cutout: GALAXY_PUNCH,
    buttons: GALAXY_BUTTONS,
    antennaLines: [0.08, 0.92],
    finishes: {
      "titanium-silverblue": "titanium-silverblue",
      "titanium-black": "titanium-black",
      "titanium-gray": "titanium-gray",
      "titanium-whitesilver": "titanium-whitesilver",
    },
    defaultFinish: "titanium-silverblue",
  },
};

/** Every value `clips[].device` accepts, aliases included. */
export const DEVICE_NAMES = [
  ...DEVICE_IDS,
  ...(Object.keys(DEVICE_ALIASES) as DeviceAlias[]),
  "none",
] as const;

const isAlias = (device: string): device is DeviceAlias =>
  device in DEVICE_ALIASES;

/** The model behind a `device` value, or null for `none`. */
export const resolveModel = (device: string): DeviceModel | null => {
  if (device === "none") {
    return null;
  }
  const id = isAlias(device) ? DEVICE_ALIASES[device] : device;
  const model = MODELS[id as DeviceId];
  if (!model) {
    throw new Error(`Unknown device "${device}"`);
  }
  return model;
};
