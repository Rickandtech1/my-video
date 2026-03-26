// src/social/pipeline.ts
import { loadConfig } from "./config";
import { discoverContent } from "./content";
import { generateCaption } from "./caption";
import { addToQueue, getQueue, updateEntry, markProcessed } from "./queue";
import { sendDraftEmail } from "./email";
import { postContent } from "./poster";
import { appendFileSync } from "fs";

function log(msg: string): void {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(line);
  appendFileSync("social.log", line);
}

export async function runPost(): Promise<void> {
  const config = loadConfig();
  const items = discoverContent();

  if (items.length === 0) {
    log("No new content found in out/");
    return;
  }

  log(`Found ${items.length} new item(s)`);

  for (const item of items) {
    try {
      const captionDraft = await generateCaption({
        apiKey: config.anthropicApiKey,
        fileName: item.fileName,
        contentType: item.contentType,
      });

      const entry = addToQueue({
        contentType: item.contentType,
        filePath: item.filePath,
        captionDraft,
        platforms: ["instagram", "facebook", "threads"],
      });

      await sendDraftEmail(
        {
          gmailUser: config.gmailUser,
          gmailAppPassword: config.gmailAppPassword,
          recipientEmail: config.gmailUser,
        },
        entry
      );

      markProcessed(item.filePath);
      log(`Queued and emailed draft for ${item.fileName}`);
    } catch (err) {
      log(`Error processing ${item.fileName}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export async function postApproved(): Promise<void> {
  const config = loadConfig();
  const queue = getQueue().filter((e) => e.status === "approved" || e.status === "edited");

  if (queue.length === 0) {
    log("No approved posts to send");
    return;
  }

  for (const entry of queue) {
    log(`Posting ${entry.filePath}...`);
    const results = await postContent({ apiKey: config.composioApiKey }, entry);

    const allSucceeded = results.every((r) => r.success);
    const failures = results.filter((r) => !r.success);

    if (allSucceeded) {
      updateEntry(entry.id, { status: "posted", postedAt: new Date().toISOString() });
      log(`Posted to all platforms`);
    } else {
      const failedPlatforms = failures.map((f) => `${f.platform}: ${f.error}`).join(", ");
      updateEntry(entry.id, { status: "failed", failureReason: failedPlatforms });
      log(`Failed on: ${failedPlatforms}`);
    }
  }
}
