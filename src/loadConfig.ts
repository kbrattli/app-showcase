import { z } from "zod";
import {
  showcaseSchema,
  type ShowcaseConfig,
  type ShowcaseInput,
} from "./schema";

export class ShowcaseConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ShowcaseConfigError";
  }
}

const formatPath = (path: PropertyKey[]): string => {
  if (path.length === 0) {
    return "(root)";
  }
  return path.reduce<string>((acc, key) => {
    if (typeof key === "number") {
      return `${acc}[${key}]`;
    }
    return acc ? `${acc}.${String(key)}` : String(key);
  }, "");
};

/**
 * Validates the raw contents of showcase.json, applies defaults and resolves
 * `layout`. Throws a ShowcaseConfigError listing every problem in plain
 * language instead of a raw zod dump.
 */
export const parseShowcase = (raw: unknown): ShowcaseConfig => {
  const result = showcaseSchema.safeParse(raw);
  if (!result.success) {
    const lines = result.error.issues.map(
      (issue: z.core.$ZodIssue) =>
        `  • ${formatPath(issue.path)}: ${issue.message}`,
    );
    throw new ShowcaseConfigError(
      [
        "showcase.json is invalid:",
        ...lines,
        "",
        "Fix the file (or the one passed with --props) and run `npm run render` again.",
        "Every field is documented in README.md.",
      ].join("\n"),
    );
  }

  const parsed = result.data;
  return {
    ...parsed,
    layout:
      parsed.layout ?? (parsed.clips.length > 1 ? "sideBySide" : "single"),
  };
};

/** Re-exported so callers only need one import. */
export type { ShowcaseConfig, ShowcaseInput };
