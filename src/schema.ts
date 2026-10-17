import { zColor } from "@remotion/zod-types";
import { z } from "zod";

/**
 * Schema for `showcase.json`. Every field a user or AI agent can edit is
 * declared here, with its default. Remotion Studio reads this schema to build
 * the props editor, and `parseShowcase()` in `loadConfig.ts` uses it to
 * validate the JSON before rendering.
 */

export const deviceSchema = z
  .enum(["iphone", "android", "none"])
  .describe("Device frame drawn around the recording");

export const layoutSchema = z.enum(["single", "sideBySide"]);

export const clipSchema = z
  .object({
    src: z
      .string()
      .min(1, "src must be a file name inside public/, e.g. \"recording.mp4\"")
      .describe("File name inside public/"),
    trimStart: z
      .number()
      .min(0, "trimStart must be 0 or more seconds")
      .default(0)
      .describe("Seconds to skip at the start of the recording"),
    trimEnd: z
      .number()
      .positive("trimEnd must be more than 0 seconds")
      .optional()
      .describe("Second at which the recording stops. Omit to play to the end"),
    device: deviceSchema.default("iphone"),
    label: z
      .string()
      .optional()
      .describe("Optional caption shown under the device"),
    muted: z
      .boolean()
      .default(true)
      .describe("Silence the recording's audio track (default true)"),
  })
  .refine(
    (clip) => clip.trimEnd === undefined || clip.trimEnd > clip.trimStart,
    { message: "trimEnd must be greater than trimStart", path: ["trimEnd"] },
  );

export const outputSchema = z.object({
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
  fps: z.number().positive().default(30),
});

export const shadowSchema = z.object({
  enabled: z.boolean().default(true),
  blur: z.number().min(0).default(40).describe("Blur radius in px at 1080p"),
  offsetY: z.number().default(20).describe("Vertical offset in px at 1080p"),
  opacity: z.number().min(0).max(1).default(0.18),
});

export const showcaseSchema = z.object({
  output: outputSchema.prefault({}),
  background: zColor().default("#FFFFFF"),
  clips: z
    .array(clipSchema)
    .min(1, "clips must contain at least one entry")
    .max(2, "clips supports at most two entries"),
  layout: layoutSchema
    .optional()
    .describe("Defaults to sideBySide for two clips, single for one"),
  shadow: shadowSchema.prefault({}),
  intro: z.number().min(0).default(0.5).describe("Fade-in duration in seconds"),
  outro: z.number().min(0).default(0.5).describe("Fade-out duration in seconds"),
});

/** What a user writes in showcase.json (all defaults optional). */
export type ShowcaseInput = z.input<typeof showcaseSchema>;

/** Parsed config with defaults applied and `layout` resolved. */
export type ShowcaseConfig = Omit<z.output<typeof showcaseSchema>, "layout"> & {
  layout: z.output<typeof layoutSchema>;
};

export type ClipConfig = ShowcaseConfig["clips"][number];
export type Device = z.output<typeof deviceSchema>;
export type Layout = z.output<typeof layoutSchema>;
