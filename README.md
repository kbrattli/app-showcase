# app-showcase

Turn one or two mobile screen recordings into a polished showcase MP4: real phone
models drawn as vector art, a flat background, a soft shadow, and a fade in and out. The
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

### With an AI agent

Open the repo in Claude Code, Codex, Cursor or any agent that reads
`CLAUDE.md` / `AGENTS.md`, hand it your recording and say:

> Make an app showcase for this video, iPhone 15 Pro

That is the whole job. The agent copies the recording into `public/`, picks
the drawn model, renders, and gives you `out/showcase.mp4`. Every model is
drawn from its real dimensions, so you never need a bezel image or any other
file to show what the phone looks like. Any model from the table below works
("Pixel 10 Pro", "Galaxy S25 Ultra", "black iPhone 16 Pro").

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
| `clips[].device` | model id, `"iphone"`, `"android"` or `"none"` | `"iphone"` | Phone drawn around the recording. Model ids: `iphone-17-pro`, `iphone-17`, `iphone-16-pro`, `iphone-16`, `iphone-15-pro`, `pixel-10-pro`, `pixel-9-pro`, `galaxy-s25`, `galaxy-s25-ultra`. `iphone` and `android` always mean the newest Pro model. `none` shows the recording with rounded corners and no frame, at its own aspect ratio. |
| `clips[].finish` | string | first finish of the model | Body colour. See the finishes table below. |
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

### Phone models and finishes

Every model is drawn as vector art from its real dimensions (body size,
screen size, bezel width, corner shape, button layout), so it scales to any
output size. The recording is scaled to cover the model's screen, so pick the
model it was recorded on: iPhone 16 is 6.1", the other iPhones are 6.3",
the Pixels are 6.3" at 20:9 and the Galaxy S25 is 19.5:9.

| `device` | Finishes (`finish`) |
| --- | --- |
| `iphone-17-pro` (also `iphone`) | `silver`, `cosmic-orange`, `deep-blue` |
| `iphone-17` | `black`, `white`, `sage`, `lavender`, `mist-blue` |
| `iphone-16-pro` | `natural`, `black`, `white`, `desert` |
| `iphone-16` | `black`, `white`, `pink`, `teal`, `ultramarine` |
| `iphone-15-pro` | `natural`, `blue`, `white`, `black` |
| `pixel-10-pro` (also `android`) | `obsidian`, `porcelain`, `moonstone`, `jade` |
| `pixel-9-pro` | `obsidian`, `porcelain`, `hazel`, `rose-quartz` |
| `galaxy-s25` | `navy`, `icy-blue`, `mint`, `silver-shadow` |
| `galaxy-s25-ultra` | `titanium-silverblue`, `titanium-black`, `titanium-gray`, `titanium-whitesilver` |

### Examples

- `showcase.json`: the default, both samples side by side with labels.
- `examples/single.json`: one iPhone, centered.
- `examples/models.json`: iPhone 17 Pro in cosmic orange next to a Pixel 10 Pro in porcelain.
- `examples/galaxy.json`: one Galaxy S25 Ultra.

## How it works

- `src/schema.ts` is the zod schema for `showcase.json`; `src/loadConfig.ts`
  turns validation failures into readable errors.
- `src/Root.tsx` registers the `Showcase` composition and uses
  `calculateMetadata` to read each clip's real duration and derive the
  output size, fps and length.
- `src/devices/` draws the phones as vector art: `models.ts` holds each
  model's real dimensions, `finishes.ts` the colour palettes and
  `PhoneSvg.tsx` renders any model from them (no image assets, nothing to
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
