// tests/social/pipeline.test.ts
import { runPost, postApproved } from "../../src/social/pipeline";

jest.mock("../../src/social/config", () => ({
  loadConfig: jest.fn().mockReturnValue({
    composioApiKey: "c-key",
    anthropicApiKey: "a-key",
    gmailAppPassword: "g-pass",
    gmailUser: "user@gmail.com",
  }),
}));
jest.mock("../../src/social/content", () => ({
  discoverContent: jest.fn().mockReturnValue([
    { filePath: "out/video.mp4", fileName: "video.mp4", contentType: "video" },
  ]),
}));
jest.mock("../../src/social/caption", () => ({
  generateCaption: jest.fn().mockResolvedValue("Test caption #test"),
}));
jest.mock("../../src/social/queue", () => ({
  addToQueue: jest.fn().mockReturnValue({ id: "123", status: "pending", filePath: "out/video.mp4", captionDraft: "Test caption", platforms: ["instagram"] }),
  getQueue: jest.fn().mockReturnValue([]),
  updateEntry: jest.fn(),
  markProcessed: jest.fn(),
}));
jest.mock("../../src/social/email", () => ({
  sendDraftEmail: jest.fn().mockResolvedValue(undefined),
}));
jest.mock("../../src/social/poster", () => ({
  postContent: jest.fn().mockResolvedValue([{ platform: "instagram", success: true }]),
}));

describe("runPost", () => {
  it("discovers content, generates captions, queues entries, and sends emails", async () => {
    const { addToQueue } = await import("../../src/social/queue");
    const { sendDraftEmail } = await import("../../src/social/email");

    await runPost();

    expect(addToQueue).toHaveBeenCalled();
    expect(sendDraftEmail).toHaveBeenCalled();
  });
});

describe("postApproved", () => {
  it("posts approved entries and marks them as posted", async () => {
    const { getQueue, updateEntry } = await import("../../src/social/queue");
    const { postContent } = await import("../../src/social/poster");
    (getQueue as jest.Mock).mockReturnValue([
      {
        id: "abc",
        status: "approved",
        filePath: "out/video.mp4",
        captionDraft: "caption",
        platforms: ["instagram"],
        contentType: "video",
        createdAt: "",
      },
    ]);

    await postApproved();

    expect(postContent).toHaveBeenCalled();
    expect(updateEntry).toHaveBeenCalledWith("abc", expect.objectContaining({ status: "posted" }));
  });
});
