# app-showcase

Turn one or two mobile screen recordings into a polished showcase MP4: phones
drawn in CSS, a flat background, a soft shadow, and a fade in and out. The
whole video is described by one JSON file, so a person or an AI agent can
change it without touching React code. Built with [Remotion](https://www.remotion.dev).

## Requirements

- Node.js 20 or newer (`.nvmrc` says 24). Nothing else: Remotion bundles its
  own headless browser and encoder, so you do not need ffmpeg or Python.
- Any OS Remotion supports (macOS, Windows, Linux).

## Quick start

1. Clone and install:

   ```bash
   git clone <this repo> app-showcase && cd app-showcase && npm install
   ```

2. Drop your screen recordings into `public/` (MP4 with H.264 is the safe
   choice) and point `showcase.json` at them:

   ```json
   {
     "clips": [
       { "src": "my-recording.mp4", "trimStart": 2, "trimEnd": 9, "device": "iphone", "label": "Onboarding" }
     ]
   }
   ```

3. Render:

   ```bash
   npm run render
   ```

   The video lands in `out/showcase.mp4`.

The repo ships with two generated sample recordings, so `npm run render`
works straight after `npm install`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run studio` | Opens Remotion Studio for a live preview of `showcase.json`. |
| `npm run render` | Renders `showcase.json` to `out/showcase.mp4`. |
| `npm run render -- --props=examples/single.json` | Renders a different config. Keep as many configs as you like. |
| `npm run render -- out/vertical.mp4 --props=my-vertical.json` | First positional argument is the output path. Other flags go to `remotion render`. |
| `npm run samples` | Regenerates the two sample recordings in `public/`. |
| `npm run typecheck` | Runs `tsc --noEmit`. |

In Studio, the props panel lets you preview changes, but it cannot write them
back because the defaults come from `showcase.json`. Edit the JSON file
directly; Studio reloads on save.

## `showcase.json` fields

Every field except `clips[].src` is optional and falls back to the default
shown. Validation runs before rendering and prints a plain-language error for
anything wrong, including a missing video file or a trim past the end of it.

| Field | Type | Default | Meaning |
| --- | --- | --- | --- |
| `output.width` | integer | `1080` | Frame width in pixels. |
| `output.height` | integer | `1350` | Frame height in pixels. The default is 4:5 portrait, which fits a phone and plays uncropped in Instagram, LinkedIn, X and Threads feeds. Use `1920` x `1080` for landscape (YouTube, a website hero), `1080` x `1920` for vertical (Reels, Shorts), `2160` x `2700` for a sharper 4:5 master. |
| `output.fps` | number | `30` | Frames per second. |
| `background` | hex color | `"#FFFFFF"` | Flat color filling the whole frame. |
| `clips` | array (1–2) | required | The recordings to show. |
| `clips[].src` | string | required | File name inside `public/`, for example `"demo.mp4"`. |
| `clips[].trimStart` | seconds | `0` | Skip this much of the start of the recording. |
| `clips[].trimEnd` | seconds | end of file | Stop the recording at this second. Must be greater than `trimStart` and within the file. |
| `clips[].device` | `"iphone"` \| `"android"` \| `"none"` | `"iphone"` | Frame to draw. `none` shows the recording with rounded corners and no frame, at its own aspect ratio. |
| `clips[].label` | string | none | Caption shown under the device. |
| `clips[].muted` | boolean | `true` | Set to `false` to keep the recording's audio. |
| `layout` | `"single"` \| `"sideBySide"` | `sideBySide` for two clips, else `single` | How devices are arranged. |
| `shadow.enabled` | boolean | `true` | Draw a drop shadow under each device. |
| `shadow.blur` | px at 1080p | `40` | Shadow blur radius. Scales with output resolution. |
| `shadow.offsetY` | px at 1080p | `20` | How far the shadow sits below the device. |
| `shadow.opacity` | 0–1 | `0.18` | Shadow darkness. Keep it low for a soft look. |
| `intro` | seconds | `0.5` | Fade-in duration at the start. |
| `outro` | seconds | `0.5` | Fade-out duration at the end. |

The video's length is computed, not set: longest trimmed clip + `intro` +
`outro`. A shorter clip holds its last frame while the longer one finishes.
Recordings whose aspect ratio does not match the device screen are scaled to
cover and centered, never stretched.

### Examples

- `showcase.json`: the default, both samples side by side with labels.
- `examples/single.json`: one iPhone, centered.

## How it works

- `src/schema.ts` is the zod schema for `showcase.json`; `src/loadConfig.ts`
  turns validation failures into readable errors.
- `src/Root.tsx` registers the `Showcase` composition and uses
  `calculateMetadata` to read each clip's real duration and derive the
  output size, fps and length.
- `src/devices/` draws the phones with plain CSS (no image assets, nothing to
  license), sized from the output frame so 4K renders are not tiny phones.
- `src/ClipVideo.tsx` plays each recording with `OffthreadVideo`, trimmed per
  the JSON and clipped to the screen's rounded corners.
- `src/samples/` generates the two sample recordings.

For AI agents, `CLAUDE.md` / `AGENTS.md` describe exactly which files to edit
for common requests.

## License note

This repo's code is MIT-licensed. Remotion itself has its own license: it is
free for individuals and for companies with up to three people, and requires a
paid company license above that. See
[remotion.pro/license](https://www.remotion.pro/license).
