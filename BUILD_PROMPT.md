# Build prompt: cloneable Remotion app-showcase repo

Copy everything below the line into Claude Code, Cursor, or another coding agent, run from the root of this empty repo.

---

You are building a cloneable, AI-editable video toolkit in this repository using Remotion. The end product lets someone clone the repo, drop in one or two mobile screen recordings, describe what they want (either by editing a JSON file or by prompting an AI agent with their own credits), and export an MP4 showcase video.

## How to work

1. Before writing any code, create `PLAN.md` in the repo root. It must be a step-by-step checklist using GitHub task syntax (`- [ ]`), ordered so each step can be verified before the next starts. Group steps under short headings. Include the verification command or check for each step in the same line or a sub-bullet.
2. Work through `PLAN.md` top to bottom. When a step is done and verified, change its `- [ ]` to `- [x]` before starting the next one. Never mark a step done that you did not verify. If you discover a needed step, add it to `PLAN.md` where it belongs rather than doing it silently.
3. Commit after each major heading in `PLAN.md` is complete, with a short message naming the heading.
4. If Remotion's official AI skills or rules are available (check `npx skills add remotion-dev/skills` or the Remotion docs for agents), install and use them so your Remotion code follows current APIs. Do not rely on memory for Remotion API names; check `node_modules/remotion` types or the docs when unsure.
5. Finish by rendering a real sample video and confirming the MP4 exists, plays, and matches the spec below. Do not report done until that render has succeeded.

## Functional spec

**Stack**
- Remotion (latest stable) with TypeScript, scaffolded with the official blank or hello-world template, then stripped to only what is needed.
- Node only. Users must not need to install ffmpeg or Python; Remotion handles rendering.
- No external image assets for device frames. Draw devices with CSS and React so they are license-free and editable by prompt.

**Input: `showcase.json`**
- A single JSON file in the repo root fully describes the video. The composition reads it; a user or AI edits only this file for common changes.
- Fields, at minimum:
  - `output`: width, height, fps. Default 1920x1080 at 30 fps. Must also work at 1080x1920 (vertical) and 3840x2160.
  - `background`: a color, default pure white `#FFFFFF`.
  - `clips`: an array of one or two entries. Each entry has `src` (file name inside `public/`), `trimStart` and `trimEnd` in seconds, `device` (at least `iphone` and `android`, with a plain `none` option), and an optional `label` string shown under the device.
  - `layout`: `single` or `sideBySide`, with sensible spacing. If two clips are given and layout is omitted, default to `sideBySide`.
  - `shadow`: an object with `enabled` (default true), `blur`, `offsetY`, `opacity`. Default to a soft, subtle shadow, not a heavy one.
  - `intro` and `outro`: optional fade durations in seconds, default 0.5.
- Validate the JSON with zod (Remotion supports zod schemas for props) and fail with a readable error message if a field is wrong or a video file is missing.
- The composition duration must be computed from the clips (longest trimmed clip plus intro and outro), not hardcoded. Use Remotion's `calculateMetadata` for this.

**Rendering**
- Use `OffthreadVideo` for clips, with the trim fields applied via Remotion's trimming props.
- Video inside the device must be clipped to the screen area with rounded corners matching the device.
- If the recording's aspect ratio does not match the device screen, scale to cover and center. Do not stretch.
- Device frame: rounded body, thin bezel, a dynamic island for `iphone`, a centered hole punch for `android`, subtle side buttons. Keep it tasteful and realistic, not cartoonish. Device size should scale with output resolution so a 4K render is not a tiny phone.
- Shadow is a CSS `box-shadow` or `filter: drop-shadow` on the device, driven by the `shadow` fields.
- Background is a flat color filling the whole frame. No gradients or textures by default.

**Scripts in `package.json`**
- `npm run studio`: open Remotion Studio for live preview.
- `npm run render`: render to `out/showcase.mp4` using `showcase.json`.
- `npm run render -- --props=other.json`: should also work, so people can keep multiple configs.

**Sample content**
- Generate two short sample screen recordings into `public/` (for example, 6 and 8 seconds, phone aspect ratio) so the repo renders out of the box. Generate them with Remotion itself or a tiny script, not by downloading. Keep them small.
- Ship a default `showcase.json` that shows both samples side by side, and a second example `examples/single.json` that shows only one.

**Docs for humans and agents**
- `README.md`: what the repo does, requirements (Node version), three-step quick start (clone, add recordings to `public/`, edit `showcase.json`, `npm run render`), a table of every `showcase.json` field, and a note about Remotion's license (free for individuals and companies up to three people, paid above that).
- `CLAUDE.md` and an identical `AGENTS.md`: written for an AI agent that a user will prompt with their own credits. Explain the repo layout, where recordings go, every `showcase.json` field, which files to touch for common requests (trim, swap device, change background, change shadow, add a label, go vertical), how to verify with `npm run render`, and what not to touch. Include three example user prompts with the exact edits they should produce.

## Quality bar

- `npm run render` on a fresh clone with only `npm install` must succeed.
- `npx tsc --noEmit` passes.
- The default render: white background, two phones side by side, both videos trimmed per JSON, soft shadow, 0.5 s fade in and out.
- The single-clip example renders centered.
- A vertical 1080x1920 render of the single example produces a correctly sized device.
- No warnings from Remotion about missing durations, unmounted videos, or deprecated props.

When every item in `PLAN.md` is checked, give a short summary of what was built, the exact commands to preview and render, and anything you could not verify.
