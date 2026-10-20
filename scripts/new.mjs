// Starts a new showcase from one or two screen recordings.
//
//   npm run new -- ~/Desktop/demo.mp4
//   npm run new -- ~/Desktop/demo.mp4 --device iphone-15-pro --finish black
//   npm run new -- before.mp4 after.mp4 --name compare     (two clips, side by side)
//
// Creates showcases/<name>/ with a copy of each recording and a showcase.json
// that plays the whole recording in the chosen phone. With --name and a
// single recording, the copy is renamed <name>.<ext> so a random file name
// (a UUID, "Screen Recording 2025-10-20...") does not end up in the folder.
// Nothing under showcases/ is tracked by git. Render it with
// `npm run render -- <name>`.
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { display, root } from "./remotion.mjs";

const usage = `Usage: npm run new -- <recording.mp4> [<second.mp4>] [--name <folder>] [--device <model>] [--finish <colour>]

  --name    Folder under showcases/ (default: the first recording's file name).
            A single recording is also renamed <name>.<ext> inside the folder.
  --device  iphone (default), android, none, or a model id such as iphone-15-pro
  --finish  A body colour that model comes in, e.g. black, porcelain`;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const args = process.argv.slice(2);
const videos = [];
const options = {};
for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  const match = /^--(name|device|finish)(?:=(.*))?$/.exec(arg);
  if (match) {
    options[match[1]] = match[2] ?? args[++i];
    if (options[match[1]] === undefined) fail(`Missing value for --${match[1]}\n\n${usage}`);
  } else if (arg === "--help" || arg === "-h") {
    console.log(usage);
    process.exit(0);
  } else if (arg.startsWith("-")) {
    fail(`Unknown option ${arg}\n\n${usage}`);
  } else {
    videos.push(path.resolve(arg));
  }
}

if (videos.length === 0) fail(usage);
if (videos.length > 2) fail("A showcase shows at most two recordings.");
for (const video of videos) {
  if (!existsSync(video)) fail(`Recording not found: ${video}`);
}

const slug = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "showcase";

const name = slug(options.name ?? path.basename(videos[0], path.extname(videos[0])));
const folder = path.join(root, "showcases", name);
const configPath = path.join(folder, "showcase.json");
if (existsSync(configPath)) {
  fail(
    `${display(configPath)} already exists. Edit it, or pick another name with --name.`,
  );
}

mkdirSync(folder, { recursive: true });

const clips = videos.map((video) => {
  const fileName =
    options.name && videos.length === 1
      ? `${name}${path.extname(video).toLowerCase()}`
      : path.basename(video).replace(/\s+/g, "-");
  const destination = path.join(folder, fileName);
  if (path.resolve(destination) !== video) copyFileSync(video, destination);
  const clip = { src: fileName, device: options.device ?? "iphone" };
  if (options.finish) clip.finish = options.finish;
  return clip;
});

const config = {
  output: { width: 1080, height: 1350, fps: 30 },
  background: "#FFFFFF",
  clips,
  layout: clips.length > 1 ? "sideBySide" : "single",
  shadow: { enabled: true, blur: 40, offsetY: 20, opacity: 0.18 },
  intro: 0.5,
  outro: 0.5,
};
writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Created ${display(folder)}/`);
for (const clip of clips) console.log(`  ${clip.src}`);
console.log("  showcase.json");
console.log(`\nNext:  npm run render -- ${name}`);
