#!/usr/bin/env ts-node
// src/social/index.ts
// Usage: npm run social -- --image <url> --caption "your caption" [--platforms instagram,facebook]
//
// Content creation and approval happen in the Claude Code conversation.
// This script is called only after the user approves the image + caption in chat.

import { loadConfig } from "./config";
import { post } from "./poster";

function parseArgs(): { imageUrl: string; caption: string; platforms: ("instagram" | "facebook")[] } {
  const args = process.argv.slice(2);
  const get = (flag: string) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };

  const imageUrl = get("--image");
  const caption  = get("--caption");
  const raw      = get("--platforms");

  if (!imageUrl) { console.error("Missing --image <url>"); process.exit(1); }
  if (!caption)  { console.error("Missing --caption <text>"); process.exit(1); }

  const platforms = raw
    ? (raw.split(",").map(p => p.trim()) as ("instagram" | "facebook")[])
    : ["instagram", "facebook"] as ("instagram" | "facebook")[];

  return { imageUrl, caption, platforms };
}

(async () => {
  const { imageUrl, caption, platforms } = parseArgs();
  const config = loadConfig();

  console.log(`\nPosting to: ${platforms.join(", ")}`);
  console.log(`Image: ${imageUrl}`);
  console.log(`Caption preview: ${caption.slice(0, 80)}...\n`);

  const results = await post(config, imageUrl, caption, platforms);

  for (const r of results) {
    if (r.success) {
      console.log(`✓ ${r.platform} — posted (${r.postId})`);
    } else {
      console.log(`✗ ${r.platform} — failed: ${r.error}`);
    }
  }
})();
