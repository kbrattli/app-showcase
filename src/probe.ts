import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { staticFile } from "remotion";
import { ShowcaseConfigError } from "./loadConfig";
import type { ClipConfig, ShowcaseConfig } from "./schema";

/** A clip whose `trimEnd` has been resolved against the real file. */
export type ResolvedClip = ClipConfig & {
  trimEnd: number;
  /** Duration of the source file in seconds, for reference. */
  sourceDurationInSeconds: number;
  /** Pixel size of the source video; used to size the `none` device. */
  sourceWidth: number;
  sourceHeight: number;
};

export type ClipProbe = {
  durationInSeconds: number;
  width: number;
  height: number;
};

export type ResolvedShowcase = Omit<ShowcaseConfig, "clips"> & {
  clips: ResolvedClip[];
};

/**
 * True when props have already been through `resolveClips()` (as they are
 * after calculateMetadata). zod strips unknown keys, so resolved props must
 * not be parsed again.
 */
export const isResolvedShowcase = (
  props: unknown,
): props is ResolvedShowcase => {
  if (typeof props !== "object" || props === null) {
    return false;
  }
  const candidate = props as Partial<ResolvedShowcase>;
  return (
    typeof candidate.layout === "string" &&
    Array.isArray(candidate.clips) &&
    candidate.clips.length > 0 &&
    candidate.clips.every(
      (clip) =>
        typeof clip.sourceWidth === "number" &&
        typeof clip.sourceHeight === "number" &&
        typeof clip.trimEnd === "number",
    )
  );
};

const toAbsoluteUrl = (path: string): string => {
  if (/^https?:\/\//.test(path)) {
    return path;
  }
  if (typeof window !== "undefined") {
    return new URL(path, window.location.origin).href;
  }
  return path;
};

const fileNotFound = (src: string): ShowcaseConfigError =>
  new ShowcaseConfigError(
    [
      `Video file "${src}" was not found next to showcase.json.`,
      "Copy the recording into the showcase folder (showcases/<name>/, or public/",
      "for an example config) and reference it by file name only, for example:",
      `"src": "${src.split("/").pop() ?? src}".`,
    ].join("\n"),
  );

/** Reads duration and size of a file in the public dir, failing readably if missing. */
export const probeClip = async (
  src: string,
  signal?: AbortSignal,
): Promise<ClipProbe> => {
  const url = toAbsoluteUrl(staticFile(src));

  const head = await fetch(url, { method: "HEAD", signal }).catch(() => null);
  if (!head || !head.ok) {
    throw fileNotFound(src);
  }

  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(url) });
  try {
    const durationInSeconds = await input.computeDuration();
    const track = await input.getPrimaryVideoTrack();
    if (!track) {
      throw new Error("no video track");
    }
    return {
      durationInSeconds,
      width: track.displayWidth,
      height: track.displayHeight,
    };
  } catch (err) {
    throw new ShowcaseConfigError(
      `Video file "${src}" could not be read as a video (${(err as Error).message}). ` +
        "Re-export it as an MP4 (H.264) and try again.",
    );
  } finally {
    input.dispose();
  }
};

/** Resolves every clip's trimEnd and validates trims against the real file. */
export const resolveClips = async (
  config: ShowcaseConfig,
  signal?: AbortSignal,
): Promise<ResolvedShowcase> => {
  const clips = await Promise.all(
    config.clips.map(async (clip, index): Promise<ResolvedClip> => {
      const probe = await probeClip(clip.src, signal);
      const sourceDurationInSeconds = probe.durationInSeconds;
      const trimEnd = clip.trimEnd ?? sourceDurationInSeconds;
      const where = `clips[${index}]`;

      if (clip.trimStart >= sourceDurationInSeconds) {
        throw new ShowcaseConfigError(
          `${where}.trimStart (${clip.trimStart}s) is past the end of "${clip.src}", ` +
            `which is ${sourceDurationInSeconds.toFixed(2)}s long.`,
        );
      }
      if (trimEnd > sourceDurationInSeconds + 0.05) {
        throw new ShowcaseConfigError(
          `${where}.trimEnd (${trimEnd}s) is past the end of "${clip.src}", ` +
            `which is ${sourceDurationInSeconds.toFixed(2)}s long. ` +
            "Lower trimEnd or remove it to play to the end.",
        );
      }

      return {
        ...clip,
        trimEnd: Math.min(trimEnd, sourceDurationInSeconds),
        sourceDurationInSeconds,
        sourceWidth: probe.width,
        sourceHeight: probe.height,
      };
    }),
  );

  return { ...config, clips };
};
