import { ALL_FORMATS, Input, UrlSource } from "mediabunny";
import { staticFile } from "remotion";
import { ShowcaseConfigError } from "./loadConfig";
import type { ClipConfig, ShowcaseConfig } from "./schema";

/** A clip whose `trimEnd` has been resolved against the real file. */
export type ResolvedClip = ClipConfig & {
  trimEnd: number;
  /** Duration of the source file in seconds, for reference. */
  sourceDurationInSeconds: number;
};

export type ResolvedShowcase = Omit<ShowcaseConfig, "clips"> & {
  clips: ResolvedClip[];
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
      `Video file "${src}" was not found in public/.`,
      "Copy your screen recording into the public/ folder and reference it by",
      `file name only, for example: "src": "${src.split("/").pop() ?? src}".`,
    ].join("\n"),
  );

/** Reads the duration of a file in public/, failing readably if it is missing. */
export const probeClipDuration = async (
  src: string,
  signal?: AbortSignal,
): Promise<number> => {
  const url = toAbsoluteUrl(staticFile(src));

  const head = await fetch(url, { method: "HEAD", signal }).catch(() => null);
  if (!head || !head.ok) {
    throw fileNotFound(src);
  }

  const input = new Input({ formats: ALL_FORMATS, source: new UrlSource(url) });
  try {
    return await input.computeDuration();
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
      const sourceDurationInSeconds = await probeClipDuration(clip.src, signal);
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
      };
    }),
  );

  return { ...config, clips };
};
