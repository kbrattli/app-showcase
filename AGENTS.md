# Guide for AI agents working in app-showcase

You are editing a Remotion project that turns mobile screen recordings into a
showcase MP4. Almost every request can be satisfied by editing one JSON file.
Read this whole file before changing anything.

## Repo layout

| Path | Purpose | Touch it? |
| --- | --- | --- |
| `showcase.json` | The video description. **This is the file to edit for nearly every request.** | Yes |
| `examples/*.json` | Alternative configs. Render one with `npm run render -- --props=examples/<name>.json`. | Yes, add more as needed |
| `public/` | Screen recordings go here. Referenced by file name only in `clips[].src`. | Add files; do not delete `sample-a.mp4` / `sample-b.mp4` |
| `out/` | Render output (`showcase.mp4`). Git-ignored. | Read only |
| `src/schema.ts` | zod schema of `showcase.json`, with defaults. | Only when adding a new field |
| `src/loadConfig.ts` | Validation and readable error messages. | Rarely |
| `src/Root.tsx` | Registers the composition; `calculateMetadata` derives size, fps and duration. | Rarely |
| `src/Showcase.tsx` | Layout: positions devices, labels, fades. | Only for layout changes the JSON cannot express |
| `src/ClipVideo.tsx` | Plays a trimmed recording inside the screen. | Rarely |
| `src/devices/` | CSS phone frames and their geometry. | Only when asked to change how a phone looks |
| `src/probe.ts` | Reads duration and size of each recording. | No |
| `src/samples/`, `scripts/samples.mjs` | Generates the sample recordings. | No |
| `scripts/render.mjs` | `npm run render` wrapper. | No |
| `remotion.config.ts`, `tsconfig.json`, `package.json` | Build config. | No |
| `PLAN.md` | Build history of this repo. | No |

## Where recordings go

Copy the user's video into `public/` and reference it by file name:
`"src": "my-recording.mp4"`. MP4 (H.264) is the safe format. If the user
mentions a file that is not in `public/`, ask for it or tell them where to put
it; do not invent a file name.

## Every `showcase.json` field

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `output.width` | integer | `1920` | Frame width. |
| `output.height` | integer | `1080` | Frame height. Vertical is `1080` x `1920`; 4K is `3840` x `2160`. |
| `output.fps` | number | `30` | Frames per second. |
| `background` | hex color string | `"#FFFFFF"` | Flat color filling the frame. |
| `clips` | array of 1–2 | required | Recordings to show. |
| `clips[].src` | string | required | File name inside `public/`. |
| `clips[].trimStart` | seconds | `0` | Skip the start of the recording. |
| `clips[].trimEnd` | seconds | end of file | Stop here. Must exceed `trimStart` and fit in the file. |
| `clips[].device` | `"iphone"` \| `"android"` \| `"none"` | `"iphone"` | Device frame. `none` = rounded rectangle, no frame, native aspect. |
| `clips[].label` | string | none | Caption under the device. |
| `clips[].muted` | boolean | `true` | `false` keeps the recording's audio. |
| `layout` | `"single"` \| `"sideBySide"` | `sideBySide` if two clips, else `single` | Arrangement. |
| `shadow.enabled` | boolean | `true` | Drop shadow under devices. |
| `shadow.blur` | number (px at 1080p) | `40` | Shadow softness. |
| `shadow.offsetY` | number (px at 1080p) | `20` | Shadow vertical offset. |
| `shadow.opacity` | 0–1 | `0.18` | Shadow darkness. |
| `intro` | seconds | `0.5` | Fade-in length. |
| `outro` | seconds | `0.5` | Fade-out length. |

Duration is always computed: longest trimmed clip + `intro` + `outro`. Never
try to set it directly.

## Which file to touch for common requests

| Request | Edit |
| --- | --- |
| Trim a clip ("start at 3 s", "cut after 10 s") | `showcase.json` → `clips[i].trimStart` / `trimEnd` |
| Swap the device ("make it an Android", "no frame") | `showcase.json` → `clips[i].device` |
| Change the background color | `showcase.json` → `background` |
| Softer / stronger / no shadow | `showcase.json` → `shadow.*` (lower `opacity` and raise `blur` for softer; `enabled: false` for none) |
| Add or change a caption | `showcase.json` → `clips[i].label` |
| Go vertical (Reels, TikTok, Shorts) | `showcase.json` → `output` `{ "width": 1080, "height": 1920 }`; with two clips also consider `"layout": "single"` since side by side is narrow in portrait |
| 4K | `showcase.json` → `output` `{ "width": 3840, "height": 2160 }` |
| Show only one of two clips | Remove the other entry from `clips` (layout falls back to `single`) |
| Longer or shorter fades | `showcase.json` → `intro` / `outro` |
| Keep the audio | `showcase.json` → `clips[i].muted: false` |
| Keep several variants | Copy `showcase.json` into `examples/<name>.json` and render with `--props` |
| Change how the phone itself looks (bezel, island, buttons) | `src/devices/geometry.ts` and `src/devices/DeviceFrame.tsx` only |
| Add a new JSON field | `src/schema.ts` (with a default), use it in `src/Showcase.tsx`, then document it in `README.md`, `CLAUDE.md` and `AGENTS.md` |

Prefer the JSON edit. Only change `src/` when the request cannot be expressed
in `showcase.json`, and keep such changes small.

## How to verify

```bash
npm run render
```

A valid config renders `out/showcase.mp4` with no errors. An invalid config
fails fast with a message that names the field (or the missing file); fix
that and run again. For a different config:

```bash
npm run render -- --props=examples/single.json
```

After editing anything under `src/`, also run `npm run typecheck`. For a
visual check without a full render, grab one frame:

```bash
npx remotion still src/index.ts Showcase out/frame.png --frame=60 --props=showcase.json
```

`npm run studio` opens a live preview. Studio's props panel cannot save back
to `showcase.json`, so make edits in the file.

## What not to touch

- `public/sample-a.mp4` and `public/sample-b.mp4`: the repo must render on a fresh clone.
- `src/probe.ts`, `scripts/`, `remotion.config.ts`, `tsconfig.json`, `package.json` dependencies and versions. All Remotion packages must stay on the same version; use `npx remotion upgrade` if an upgrade is explicitly requested.
- Do not add image assets for device frames; they are drawn in CSS on purpose (license-free, editable).
- Do not hardcode `durationInFrames`, `width`, `height` or `fps` anywhere; they come from `showcase.json` via `calculateMetadata`.
- Do not use deprecated Remotion props (`startFrom`, `endAt`, `trimAfter`). Use `trimBefore` and `durationInFrames`.
- Do not remove the Remotion license notice in `LICENSE` or `README.md`. The repo code is MIT, but Remotion itself is a separately licensed dependency (free up to three people, paid above).
- Do not install ffmpeg or Python-based tooling; Remotion handles rendering. If you need ffmpeg for a one-off, `npx remotion ffmpeg` is bundled.

## Example prompts and the exact edits they should produce

### 1. "Use my recording onboarding.mp4, skip the first 2 seconds and stop at 12, and call it Onboarding."

Confirm `public/onboarding.mp4` exists. Then set `clips` to a single entry:

```json
"clips": [
  {
    "src": "onboarding.mp4",
    "trimStart": 2,
    "trimEnd": 12,
    "device": "iphone",
    "label": "Onboarding"
  }
]
```

Remove `"layout": "sideBySide"` or set it to `"single"`. Run `npm run render`.

### 2. "Make the second phone an Android, turn the background light grey and make the shadow barely visible."

Edit three places in `showcase.json`:

```json
"background": "#F2F2F5",
"clips": [
  { ...first clip unchanged... },
  { "src": "sample-b.mp4", "trimStart": 1, "trimEnd": 7, "device": "android", "label": "Checkout" }
],
"shadow": { "enabled": true, "blur": 50, "offsetY": 16, "opacity": 0.08 }
```

Run `npm run render`.

### 3. "I need a vertical version for Instagram with just the first clip."

Create `examples/vertical.json` rather than overwriting the default:

```json
{
  "output": { "width": 1080, "height": 1920, "fps": 30 },
  "background": "#FFFFFF",
  "clips": [
    { "src": "sample-a.mp4", "trimStart": 0.5, "trimEnd": 5.5, "device": "iphone", "label": "Browse" }
  ],
  "layout": "single",
  "shadow": { "enabled": true, "blur": 40, "offsetY": 20, "opacity": 0.18 },
  "intro": 0.5,
  "outro": 0.5
}
```

Render it to its own file so the default output is untouched:

```bash
npm run render -- out/vertical.mp4 --props=examples/vertical.json
```
