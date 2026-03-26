// tests/social/email.test.ts
import { sendDraftEmail, EmailConfig } from "../../src/social/email";
import { QueueEntry } from "../../src/social/queue";
import nodemailer from "nodemailer";

jest.mock("nodemailer");

const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });
const mockCreateTransport = nodemailer.createTransport as jest.Mock;
mockCreateTransport.mockReturnValue({ sendMail: mockSendMail });

const config: EmailConfig = {
  gmailUser: "test@gmail.com",
  gmailAppPassword: "test-pass",
  recipientEmail: "test@gmail.com",
};

const entry: QueueEntry = {
  id: "abc123",
  createdAt: "2026-03-25T09:00:00Z",
  status: "pending",
  contentType: "video",
  filePath: "out/my-video.mp4",
  captionDraft: "🎬 Test caption #test",
  platforms: ["instagram", "facebook", "threads"],
};

describe("sendDraftEmail", () => {
  it("sends an email with the draft caption", async () => {
    await sendDraftEmail(config, entry);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: config.recipientEmail,
        subject: expect.stringContaining("my-video.mp4"),
        text: expect.stringContaining("🎬 Test caption #test"),
      })
    );
  });
});
