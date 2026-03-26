// src/social/email.ts
import nodemailer from "nodemailer";
import { QueueEntry } from "./queue";

export interface EmailConfig {
  gmailUser: string;
  gmailAppPassword: string;
  recipientEmail: string;
}

export async function sendDraftEmail(
  config: EmailConfig,
  entry: QueueEntry
): Promise<void> {
  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.gmailUser,
      pass: config.gmailAppPassword,
    },
  });

  const platforms = entry.platforms.join(", ");
  const fileName = entry.filePath.split("/").pop() ?? entry.filePath;

  await transport.sendMail({
    from: config.gmailUser,
    to: config.recipientEmail,
    subject: `[Draft] New post ready for review — ${fileName}`,
    text: [
      `Content: ${entry.filePath}`,
      `Platforms: ${platforms}`,
      ``,
      `--- Caption Draft ---`,
      entry.captionDraft,
      ``,
      `---`,
      `Run \`npm run approve\` in Claude Code to approve, edit, or reject.`,
      `Post ID: ${entry.id}`,
    ].join("\n"),
  });
}
