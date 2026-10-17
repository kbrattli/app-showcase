# PLAN.md — Remotion app-showcase build plan

Source of truth for how this repo gets built. Work top to bottom. Tick a box (`- [x]`) only after the verification on that line passes. If a new step is needed, insert it where it belongs instead of doing it silently. Commit after each heading is fully checked, using the heading as the message.

Environment at planning time: Node v24.21.0, npm 11.19.0, Remotion 4.0.536 (latest on npm).

## 1. Scaffold

- [x] Add `.gitignore` covering `node_modules/`, `out/`, `.DS_Store`, `*.log`.
  - Verify: `cat .gitignore` lists all four entries.
- [x] Scaffold a Remotion project in the repo root with the official blank template: `npx create-video@latest --blank .` (fall back to scaffolding in a temp dir and moving files in if the CLI refuses a non-empty directory).
  - Verify: `package.json` exists and lists `remotion`, `@remotion/cli`, `react`, `react-dom`, `typescript`.
- [x] Install Remotion's official agent skills if available: `npx skills add remotion-dev/skills`. Installed `remotion-best-practices` (v4.0.536) into `.claude/skills/` with `--copy`; `skills-lock.json` records it. Note: the skill recommends `<Video>` from `@remotion/media`, but this spec asks for `OffthreadVideo`, which is still a non-deprecated core export, so the spec wins.
  - Verify: skills directory exists, or a note is recorded in this step.
- [x] Pin `engines.node` to `>=20` in `package.json` and add an `.nvmrc` with `24`.
  - Verify: `node -e "console.log(require('./package.json').engines.node)"` prints `>=20`.
- [x] Install dependencies: `npm install`. Add `zod` and `@remotion/zod-types` as dependencies.
  - Verify: `npm ls zod @remotion/zod-types remotion` shows no missing or invalid entries.
- [x] Strip the template to only `src/index.ts`, `src/Root.tsx`, `remotion.config.ts`, `tsconfig.json`, `public/`. Remove sample compositions.
  - Verify: `npx tsc --noEmit` passes and `npx remotion compositions src/index.ts` lists zero or one placeholder composition without errors.

## 2. Schema and config loading

- [x] Create `src/schema.ts` with a zod schema for `showcase.json`:
  - `output`: `{ width, height, fps }`, defaults 1920 / 1080 / 30.
  - `background`: hex color string, default `#FFFFFF`, validated with `zColor` from `@remotion/zod-types`.
  - `clips`: array of 1–2 `{ src, trimStart, trimEnd, device: 'iphone' | 'android' | 'none', label? }`; `trimEnd > trimStart`, both `>= 0`. `trimEnd` is optional: when omitted the clip plays to the end of the file (resolved in `calculateMetadata`).
  - `layout`: `'single' | 'sideBySide'`, optional; derived default is `sideBySide` when two clips are present, otherwise `single`.
  - `shadow`: `{ enabled: true, blur: 40, offsetY: 20, opacity: 0.18 }` defaults (soft, subtle).
  - `intro`, `outro`: seconds, default 0.5.
  - Export the inferred `ShowcaseProps` type.
  - Verify: `npx tsc --noEmit` passes.
- [x] Create `src/loadConfig.ts` that parses an object with the schema and, on failure, throws an `Error` whose message lists each bad field path and reason in plain language (no raw zod dump).
  - Verify: a scratch script feeding `{ clips: [] }` and `{ clips: [{ src: 'x.mp4', trimStart: 5, trimEnd: 2 }] }` prints readable messages naming `clips` and `trimEnd`.
- [x] Create root `showcase.json` (two sample clips, side by side, white background, default shadow) and `examples/single.json` (one clip, `single` layout).
  - Verify: both parse without error through `loadConfig` in the scratch script.
- [x] In `src/Root.tsx`, read `showcase.json` as `defaultProps` for a `Showcase` composition with `schema` set to the zod schema, so Remotion Studio shows an editable props panel.
  - Verify: `npx remotion compositions src/index.ts` lists `Showcase` with no errors.

## 3. Sample recordings

Moved ahead of the metadata/device work because headings 4–7 need real video files to verify against.

- [x] Create `src/samples/SampleA.tsx` and `SampleB.tsx`: simple animated fake app screens (header, list cards sliding in, a button press) at 1170x2532, 30 fps, 6 s and 8 s.
  - Verify: `npx tsc --noEmit` passes.
- [x] Register both as compositions in a separate `src/samples/index.ts` entry so they do not appear in the main Studio list.
  - Verify: `npx remotion compositions src/samples/index.ts` lists `SampleA` and `SampleB`.
- [x] Add `npm run samples` script rendering both to `public/sample-a.mp4` and `public/sample-b.mp4` with `--crf 28` to keep them small.
  - Verify: `ls -la public/*.mp4` shows both files under 3 MB each. Result: sample-a.mp4 212 KB, sample-b.mp4 133 KB.
- [x] Commit the two MP4s so a fresh clone renders without running `npm run samples`.
  - Verify: `git ls-files public/` lists both MP4s.

## 4. Duration and metadata

- [x] Implement `calculateMetadata` in `src/Root.tsx`: `durationInFrames = ceil((max(trimEnd - trimStart) + intro + outro) * fps)`, and set `width`, `height`, `fps` from `output`. Never hardcode the duration.
  - Verify: `npx remotion compositions src/index.ts` reports the expected duration for the default config (longest clip + 1 s at 30 fps).
- [x] Inside `calculateMetadata`, check each `clips[].src` exists under `public/` (a `fetch` HEAD on `staticFile(src)`, then Mediabunny `computeDuration()` to resolve an omitted `trimEnd` and reject trims past the end of the file) and throw a readable error naming the missing file.
  - Verify: temporarily point `examples/single.json` at `missing.mp4` and confirm `npx remotion render ... --props=examples/single.json` fails with a message that names `missing.mp4`; then revert.

## 5. Device frames (CSS only)

- [ ] Create `src/devices/DeviceFrame.tsx` taking `device`, `screenWidth`, `screenHeight`, `shadow`, and `children`. Body: rounded rectangle, thin bezel, screen area with matching rounded corners and `overflow: hidden`.
  - Verify: `npx tsc --noEmit` passes.
- [ ] Add `iphone` variant: dynamic island (pill) centered at top of screen, side buttons (volume up/down left, power right) drawn as thin rounded rects outside the body edge.
  - Verify: render a single frame with `npx remotion still src/index.ts Showcase out/iphone.png --props=examples/single.json` and inspect the image.
- [ ] Add `android` variant: centered hole-punch camera at top, power and volume buttons on the right edge, slightly tighter corner radius than iPhone.
  - Verify: temporary props with `device: 'android'`, render a still, inspect.
- [ ] Add `none` variant: no frame, video shown with the same rounded-corner clipping and shadow.
  - Verify: temporary props with `device: 'none'`, render a still, inspect.
- [ ] Shadow: apply `filter: drop-shadow(0 ${offsetY}px ${blur}px rgba(0,0,0,${opacity}))` on the device wrapper; omit entirely when `enabled` is false.
  - Verify: render stills with `shadow.enabled` true and false and confirm the difference visually.
- [ ] Scale: all device dimensions derive from `output.height` (device height ≈ 72% of frame height in `single`, ≈ 68% in `sideBySide`; in vertical outputs cap by width instead). No fixed pixel sizes.
  - Verify: `npx remotion still` at 1920x1080, 1080x1920 (via `examples/single.json` with `output` overridden), and 3840x2160; phones are proportionally the same size in each image.

## 6. Video playback

- [ ] Create `src/ClipVideo.tsx` rendering `OffthreadVideo` with `src={staticFile(clip.src)}`, `trimBefore` and `durationInFrames` converted from seconds to frames (`trimAfter`, `startFrom` and `endAt` are marked `@deprecated` in `node_modules/remotion/dist/cjs/video/props.d.ts`).
  - Verify: `grep -n "trimBefore\|trimAfter\|startFrom\|endAt" node_modules/remotion/dist/cjs/video/props.d.ts` confirms `trimBefore` and `durationInFrames` are not deprecated and `trimAfter` is.
- [ ] Video fills the screen area with `objectFit: 'cover'`, centered, so mismatched aspect ratios are cropped, never stretched.
  - Verify: render a still with a deliberately 1:1 test video and confirm no distortion.
- [ ] Wrap each clip in `Sequence` so a shorter clip holds its last frame (or fades) instead of unmounting early while the longer clip plays.
  - Verify: render the default config; no Remotion warning about unmounted video or missing duration in the render log.

## 7. Layout and transitions

- [ ] Create `src/Showcase.tsx`: flat `background` fill over the whole frame via `AbsoluteFill`; `single` centers one device; `sideBySide` centers two devices with a gap of ≈ 6% of frame width.
  - Verify: stills for both layouts look centered with even margins.
- [ ] Optional `label` under each device: system sans-serif, size relative to `output.height`, color `#111`, centered.
  - Verify: still with labels set on both clips shows text under each phone.
- [ ] Intro and outro fades: opacity from 0 to 1 over `intro` seconds using `interpolate` with clamping, and 1 to 0 over the final `outro` seconds.
  - Verify: stills at frame 0, frame `intro*fps`, and the last frame show opacity 0, 1, and 0 respectively.

## 8. Scripts

- [ ] `package.json` scripts: `studio` (`remotion studio src/index.ts`), `render` (`remotion render src/index.ts Showcase out/showcase.mp4 --props=showcase.json`), `samples`, `typecheck` (`tsc --noEmit`).
  - Verify: `npm run studio` opens Studio and shows the Showcase composition (close it after checking).
- [ ] Confirm `npm run render -- --props=examples/single.json` overrides the default props (the trailing `--props` must win over the one in the script; if npm argument ordering prevents this, implement a tiny `scripts/render.mjs` wrapper that forwards args).
  - Verify: the output MP4 shows one centered phone, not two.

## 9. Docs

- [ ] `README.md`: purpose, requirements (Node >= 20, no ffmpeg or Python), three-step quick start, full field table for `showcase.json`, how to use `examples/single.json` and `--props`, Remotion license note (free for individuals and companies up to three people, paid above).
  - Verify: every field in `src/schema.ts` appears in the README table (`grep` each key).
- [ ] `CLAUDE.md`: repo layout, where recordings go, every field, which files to touch for trim / swap device / background / shadow / label / vertical, how to verify with `npm run render`, what not to touch (`src/devices`, `remotion.config.ts`, `public/sample-*.mp4`), three example user prompts with the exact JSON edits.
  - Verify: file reads cleanly and references only paths that exist (`grep -o 'src/[A-Za-z/._-]*' CLAUDE.md | xargs ls`).
- [ ] `AGENTS.md` identical to `CLAUDE.md`.
  - Verify: `diff CLAUDE.md AGENTS.md` prints nothing.

## 10. Final verification

- [ ] `npx tsc --noEmit` passes with zero errors.
- [ ] `npm run render` produces `out/showcase.mp4`; log contains no warnings about missing durations, unmounted videos, or deprecated props.
  - Verify: `ls -la out/showcase.mp4` and inspect the render log.
- [ ] Probe the output: duration equals longest trimmed clip + 1 s, dimensions 1920x1080, 30 fps. Use `npx remotion` metadata output or a Node probe via `@remotion/media-parser`.
- [ ] Open `out/showcase.mp4` and confirm: white background, two phones side by side, both trimmed per JSON, soft shadow, fade in and out.
- [ ] `npm run render -- --props=examples/single.json` renders one centered phone.
- [ ] Vertical check: copy `examples/single.json` to a scratch file with `output` 1080x1920, render, confirm the device is correctly sized (not tiny, not clipped).
- [ ] 4K check: scratch config at 3840x2160, render a still, confirm the phone scales with the frame.
- [ ] Fresh-clone check: `git clone . /tmp/showcase-fresh && cd /tmp/showcase-fresh && npm install && npm run render` succeeds.
- [ ] Remove scratch files, ensure `out/` is gitignored, final commit.
- [ ] Write the closing summary: what was built, exact preview and render commands, anything not verified.
