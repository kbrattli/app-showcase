import { zColor } from "@remotion/zod-types";
import { z } from "zod";
import { DEVICE_NAMES, resolveModel } from "./devices/models";

/**
 * Schema for `showcase.json`. Every field a user or AI agent can edit is
 * declared here, with its default. Remotion Studio reads this schema to build
 * the props editor, and `parseShowcase()` in `loadConfig.ts` uses it to
 * validate the JSON before rendering.
 */

export const deviceSchema = z
  .enum(DEVICE_NAMES)
  .describe(
    "Phone model drawn around the recording. `iphone` and `android` always mean the newest model; `none` is a plain rounded rectangle",
  );

export const layoutSchema = z.enum(["single", "sideBySide"]);

export const clipSchema = z
  .object({
    src: z
      .string()
      .min(1, 'src must be a file name next to showcase.json, e.g. "recording.mp4"')
      .describe(
        "File name of the recording next to showcase.json (inside public/ for the example configs)",
      ),
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
    finish: z
      .string()
      .optional()
      .describe(
        "Body colour of the phone, by name (see README). Defaults to the model's first finish",
      ),
    label: z
      .string()
      .optional()
      .describe("Optional caption shown under the device"),
    muted: z
      .boolean()
      .default(true)
      .describe("Silence the recording's audio track (default true)"),
    timer: z
      .object({
        start: z.number().min(0).describe("Second in the recording where the stopwatch starts"),
        end: z.number().min(0).describe("Second in the recording where the stopwatch stops"),
      })
      .refine((timer) => timer.end > timer.start, {
        message: "timer.end must be greater than timer.start",
        path: ["end"],
      })
      .optional()
      .describe(
        "Stopwatch under the device during slow-motion passes (speed below 1): counts the real milliseconds between two moments of the recording",
      ),
  })
  .refine(
    (clip) => clip.trimEnd === undefined || clip.trimEnd > clip.trimStart,
    { message: "trimEnd must be greater than trimStart", path: ["trimEnd"] },
  )
  .superRefine((clip, ctx) => {
    const model = resolveModel(clip.device);
    if (clip.finish === undefined || model === null) {
      return;
    }
    if (!(clip.finish in model.finishes)) {
      ctx.addIssue({
        code: "custom",
        path: ["finish"],
        message: `finish "${clip.finish}" does not exist for ${model.label}. Choose one of: ${Object.keys(model.finishes).join(", ")}`,
      });
    }
  });

/**
 * Default output is 4:5 portrait (1080 x 1350): a phone is tall, so this
 * fills the frame instead of leaving empty space either side, and it is the
 * tallest format Instagram, LinkedIn, X and Threads show uncropped in feed.
 */
export const outputSchema = z.object({
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1350),
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
  outro: z
    .number()
    .min(0)
    .default(0.5)
    .describe("Fade-out duration in seconds"),
  speeds: z
    .array(z.number().positive("each speed must be more than 0"))
    .min(1, "speeds must contain at least one entry")
    .default([1])
    .describe(
      "Playback passes. The clips play once per entry, back to back, at that speed: 1 is normal, 0.5 is half speed",
    ),
  labelPosition: z
    .enum(["below", "above"])
    .default("below")
    .describe("Whether captions sit under or over the devices"),
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
