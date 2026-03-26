// src/social/index.ts
import readline from "readline";
import cron from "node-cron";
import { runPost, postApproved } from "./pipeline";
import { getQueue, updateEntry, removeEntry } from "./queue";

const command = process.argv[2];

async function runApprove(): Promise<void> {
  const pending = getQueue().filter((e) => e.status === "pending");

  if (pending.length === 0) {
    console.log("No posts pending approval.");
    return;
  }

  console.log(`\n📬 ${pending.length} post(s) pending approval\n`);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q: string) => new Promise<string>((res) => rl.question(q, res));

  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i];
    const fileName = entry.filePath.split("/").pop();
    console.log(`[${i + 1}/${pending.length}] ${fileName} (${entry.contentType}) — ${entry.platforms.join(", ")}`);
    console.log(`    Caption: "${entry.captionDraft}"\n`);

    const choice = await ask("    (a) Approve  (e) Edit caption  (r) Reject  > ");

    if (choice.trim().toLowerCase() === "a") {
      updateEntry(entry.id, { status: "approved" });
      console.log("    ✓ Approved\n");
    } else if (choice.trim().toLowerCase() === "e") {
      const newCaption = await ask("    New caption: ");
      updateEntry(entry.id, { status: "edited", captionDraft: newCaption.trim() });
      console.log("    ✓ Caption updated and approved\n");
    } else if (choice.trim().toLowerCase() === "r") {
      removeEntry(entry.id);
      console.log("    ✗ Rejected and removed\n");
    } else {
      console.log("    Skipped\n");
    }
  }

  rl.close();

  const toPost = getQueue().filter((e) => e.status === "approved" || e.status === "edited");
  if (toPost.length > 0) {
    console.log(`\n🚀 Posting ${toPost.length} approved item(s)...`);
    await postApproved();
  }
}

function runSchedule(): void {
  console.log("⏰ Scheduler started — running post at 9:00am daily");
  cron.schedule("0 9 * * *", async () => {
    console.log("Running scheduled post...");
    await runPost();
  });
}

(async () => {
  if (command === "post") {
    await runPost();
  } else if (command === "approve") {
    await runApprove();
  } else if (command === "schedule") {
    runSchedule();
  } else {
    console.log("Usage: npm run post | approve | schedule");
    process.exit(1);
  }
})();
