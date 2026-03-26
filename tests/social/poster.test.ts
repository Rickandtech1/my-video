// tests/social/poster.test.ts
import { postContent } from "../../src/social/poster";
import { QueueEntry } from "../../src/social/queue";

const mockExecuteAction = jest.fn();
jest.mock("composio-core", () => ({
  ComposioToolSet: jest.fn().mockImplementation(() => ({
    executeAction: mockExecuteAction,
  })),
}));

const entry: QueueEntry = {
  id: "abc123",
  createdAt: "2026-03-25T09:00:00Z",
  status: "approved",
  contentType: "video",
  filePath: "out/my-video.mp4",
  captionDraft: "🎬 Test caption",
  platforms: ["instagram", "facebook", "threads"],
};

describe("postContent", () => {
  it("calls executeAction for each platform and returns success results", async () => {
    mockExecuteAction.mockResolvedValue({ success: true });

    const results = await postContent({ apiKey: "test-key" }, entry);

    expect(mockExecuteAction).toHaveBeenCalledTimes(3);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.success)).toBe(true);
  });

  it("marks platform as failed if executeAction throws", async () => {
    mockExecuteAction
      .mockResolvedValueOnce({ success: true })
      .mockRejectedValueOnce(new Error("rate limit"))
      .mockResolvedValueOnce({ success: true });

    const results = await postContent({ apiKey: "test-key" }, entry);

    const failed = results.find((r) => !r.success);
    expect(failed).toBeDefined();
    expect(failed?.error).toContain("rate limit");
  });
});
