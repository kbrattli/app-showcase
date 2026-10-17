# Guide for AI agents working in app-showcase

You are editing a Remotion project that turns mobile screen recordings into a
showcase MP4. Almost every request can be satisfied by editing one JSON file.
Read this whole file before changing anything.

## This repo is a tool, not a gallery

The user runs this project to produce a showcase video from their own
recording. The recording, the edited `showcase.json` and the rendered MP4 are
the user's work product for that session, not repository content.

- Never commit, and never offer to commit, push or open a PR for: recordings
  added to `public/`, changes to `showcase.json`, or anything in `out/`.
  `.gitignore` already excludes recordings and `out/`; `showcase.json` is
  tracked only so a fresh clone renders, and `git checkout showcase.json`
  restores the sample config.
- The deliverable is `out/showcase.mp4`. Hand it to the user when the render
  is done, and end there. Do not ask about git.
- Commit only when the user changes the tool itself (`src/`, `scripts/`,
  docs, `.gitignore`) and asks for a commit.

## The one-line request

Most people will say something like **"Make an app showcase for this video,
iPhone 15 Pro"** and nothing more. That sentence is a complete order. Do
exactly this, without asking questions:

1. Get the recording into `public/`. If the message came with a file or a
   path, copy it there and keep the file name (replace spaces with `-`). If
   it names a file that is already in `public/`, use that one. Ask only if
   there is no file at all.
2. Pick the model from the words in the request using the table below. Every
   phone is drawn from its real dimensions in `src/devices/models.ts`, so
   never ask for, search for or suggest a bezel image, a PNG, a mock-up or any
   other file to show what the phone looks like. The tool already knows.
3. Write `showcase.json` with one clip and nothing the user did not ask for:
   no `trimStart` / `trimEnd` (the whole recording plays), no `label`, no
   `finish` unless a colour was named, default `output`, `background` and
   `shadow`, and `"layout": "single"`.
4. Run `npm run render`.
5. Hand over `out/showcase.mp4` and stop. One request, one MP4: do not render
   stills, other models or variants, and do not create `examples/*.json`,
   unless asked.

| They say | `clips[0].device` |
| --- | --- |
| "iPhone 15 Pro", "15 pro" | `iphone-15-pro` |
| "iPhone 16", "iPhone 16 Pro", "iPhone 17", "iPhone 17 Pro" | `iphone-16`, `iphone-16-pro`, `iphone-17`, `iphone-17-pro` |
| "iPhone", "Apple", or no device at all | `iphone` |
| "Pixel 9 Pro", "Pixel 10 Pro" | `pixel-9-pro`, `pixel-10-pro` |
| "Android", "Pixel", "Google" | `android` |
| "Samsung", "Galaxy", "S25" | `galaxy-s25` |
| "S25 Ultra", "Ultra" | `galaxy-s25-ultra` |
| "no frame", "just the video" | `none` |
| A model not in the list ("iPhone 14", "iPhone 16 Plus", "Pixel 8", "Galaxy S24") | The closest listed model of the same family: `iphone-15-pro`, `iphone-16`, `pixel-9-pro`, `galaxy-s25`. Say in one line which model was drawn. Do not add a model to `models.ts` for a one-off request. |

A colour in the request ("black iPhone 15 Pro", "porcelain Pixel") becomes
`clips[0].finish`, using the closest finish that model comes in.

## Repo layout

| Path | Purpose | Touch it? |
| --- | --- | --- |
| `showcase.json` | The video description. **This is the file to edit for nearly every request.** | Yes |
| `examples/*.json` | Alternative configs. Render one with `npm run render -- --props=examples/<name>.json`. | Yes, add more as needed |
| `public/` | Screen recordings go here. Referenced by file name only in `clips[].src`. Git-ignored except the two samples. | Add files; never commit them; do not delete `sample-a.mp4` / `sample-b.mp4` |
| `out/` | Render output (`showcase.mp4`). Git-ignored. | Read only |
| `src/schema.ts` | zod schema of `showcase.json`, with defaults. | Only when adding a new field |
| `src/loadConfig.ts` | Validation and readable error messages. | Rarely |
| `src/Root.tsx` | Registers the composition; `calculateMetadata` derives size, fps and duration. | Rarely |
| `src/Showcase.tsx` | Layout: positions devices, labels, fades. | Only for layout changes the JSON cannot express |
| `src/ClipVideo.tsx` | Plays a trimmed recording inside the screen. | Rarely |
| `src/devices/models.ts` | Catalogue of phone models: real mm sizes, cut-out, buttons, finishes. | To tune a model or add one |
| `src/devices/finishes.ts` | Colour palettes for the metal band. | To add or tune a finish |
| `src/devices/PhoneSvg.tsx`, `src/devices/geometry.ts`, `src/devices/DeviceFrame.tsx` | Vector phone renderer and its geometry. | Only when asked to change how every phone looks |
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
| `output.width` | integer | `1080` | Frame width. |
| `output.height` | integer | `1350` | Frame height. Default is 4:5 portrait (fits a phone, uncropped on Instagram, LinkedIn, X, Threads). Landscape is `1920` x `1080`; vertical is `1080` x `1920`; sharper 4:5 is `2160` x `2700`. |
| `output.fps` | number | `30` | Frames per second. |
| `background` | hex color string | `"#FFFFFF"` | Flat color filling the frame. |
| `clips` | array of 1–2 | required | Recordings to show. |
| `clips[].src` | string | required | File name inside `public/`. |
| `clips[].trimStart` | seconds | `0` | Skip the start of the recording. |
| `clips[].trimEnd` | seconds | end of file | Stop here. Must exceed `trimStart` and fit in the file. |
| `clips[].device` | model id, `"iphone"`, `"android"` or `"none"` | `"iphone"` | Phone model. Ids: `iphone-17-pro`, `iphone-17`, `iphone-16-pro`, `iphone-16`, `iphone-15-pro`, `pixel-10-pro`, `pixel-9-pro`, `galaxy-s25`, `galaxy-s25-ultra`. `iphone` = newest iPhone Pro, `android` = newest Pixel Pro. `none` = rounded rectangle, no frame, native aspect. |
| `clips[].finish` | string | model's first finish | Body colour. iphone-17-pro: `silver`, `cosmic-orange`, `deep-blue`. iphone-17: `black`, `white`, `sage`, `lavender`, `mist-blue`. iphone-16-pro: `natural`, `black`, `white`, `desert`. iphone-16: `black`, `white`, `pink`, `teal`, `ultramarine`. iphone-15-pro: `natural`, `blue`, `white`, `black`. pixel-10-pro: `obsidian`, `porcelain`, `moonstone`, `jade`. pixel-9-pro: `obsidian`, `porcelain`, `hazel`, `rose-quartz`. galaxy-s25: `navy`, `icy-blue`, `mint`, `silver-shadow`. galaxy-s25-ultra: `titanium-silverblue`, `titanium-black`, `titanium-gray`, `titanium-whitesilver`. An invalid finish fails validation and lists the valid ones. |
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
| Swap the device ("make it an Android", "no frame", "use a Pixel 9 Pro") | `showcase.json` → `clips[i].device` |
| Change the phone colour ("black titanium", "porcelain") | `showcase.json` → `clips[i].finish` (must be one of that model's finishes) |
| Change the background color | `showcase.json` → `background` |
| Softer / stronger / no shadow | `showcase.json` → `shadow.*` (lower `opacity` and raise `blur` for softer; `enabled: false` for none) |
| Add or change a caption | `showcase.json` → `clips[i].label` |
| Go vertical (Reels, TikTok, Shorts) | `showcase.json` → `output` `{ "width": 1080, "height": 1920 }`; with two clips also consider `"layout": "single"` since side by side is narrow in portrait |
| Go landscape (YouTube, website hero) | `showcase.json` → `output` `{ "width": 1920, "height": 1080 }` |
| 4K | `showcase.json` → `output` `{ "width": 3840, "height": 2160 }` (landscape) or `{ "width": 2160, "height": 2700 }` (4:5) |
| Show only one of two clips | Remove the other entry from `clips` (layout falls back to `single`) |
| Longer or shorter fades | `showcase.json` → `intro` / `outro` |
| Keep the audio | `showcase.json` → `clips[i].muted: false` |
| Keep several variants | Copy `showcase.json` into `examples/<name>.json` and render with `--props` |
| Tune one model (bezel width, corner shape, button position, island size) | `src/devices/models.ts` only |
| Add a phone model or a finish | `src/devices/models.ts` (+ `src/devices/finishes.ts` for a new palette), then the tables in `README.md`, `CLAUDE.md` and `AGENTS.md` |
| Change how every phone is drawn (band, chamfer, glass) | `src/devices/PhoneSvg.tsx` only |
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
- Do not add raster artwork for device frames to the repo; phones are vector art drawn from `src/devices/models.ts` on purpose (license-free, editable, scales to 4K).
- Do not hardcode `durationInFrames`, `width`, `height` or `fps` anywhere; they come from `showcase.json` via `calculateMetadata`.
- Do not use deprecated Remotion props (`startFrom`, `endAt`, `trimAfter`). Use `trimBefore` and `durationInFrames`.
- Do not remove the Remotion license notice in `LICENSE` or `README.md`. The repo code is MIT, but Remotion itself is a separately licensed dependency (free up to three people, paid above).
- Do not install ffmpeg or Python-based tooling; Remotion handles rendering. If you need ffmpeg for a one-off, `npx remotion ffmpeg` is bundled.

## Example prompts and the exact edits they should produce

### 1. "Make an app showcase for this video, iPhone 15 Pro." (with `~/Desktop/demo.mp4` attached)

Copy the recording in, keeping its name:

```bash
cp ~/Desktop/demo.mp4 public/demo.mp4
```

Replace `showcase.json` with exactly this:

```json
{
  "output": { "width": 1080, "height": 1350, "fps": 30 },
  "background": "#FFFFFF",
  "clips": [{ "src": "demo.mp4", "device": "iphone-15-pro" }],
  "layout": "single",
  "shadow": { "enabled": true, "blur": 40, "offsetY": 20, "opacity": 0.18 },
  "intro": 0.5,
  "outro": 0.5
}
```

Run `npm run render` and hand over `out/showcase.mp4`. Nothing else: no still, no second model, no example file, no bezel image.

### 2. "Use my recording onboarding.mp4, skip the first 2 seconds and stop at 12, and call it Onboarding."

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

### 3. "Make the second phone an Android, turn the background light grey and make the shadow barely visible."

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

### 4. "Make it a Pixel 9 Pro in porcelain."

Edit the clip in `showcase.json`:

```json
{ "src": "sample-a.mp4", "trimStart": 0.5, "trimEnd": 5.5, "device": "pixel-9-pro", "finish": "porcelain" }
```

Run `npm run render`. If the user names a colour that model does not come in, validation lists the valid ones; pick the closest and say so.

### 5. "I need a vertical version for Instagram with just the first clip."

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
