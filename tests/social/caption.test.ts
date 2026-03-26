import { generateCaption } from "../../src/social/caption";

const mockCreate = jest.fn();
jest.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
  return { __esModule: true, default: MockAnthropic };
});

describe("generateCaption", () => {
  it("returns caption text from Claude API", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "🎬 Amazing new video! #content #viral" }],
    });

    const result = await generateCaption({
      apiKey: "test-key",
      fileName: "my-video.mp4",
      contentType: "video",
    });

    expect(result).toBe("🎬 Amazing new video! #content #viral");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "claude-sonnet-4-6",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "user" }),
        ]),
      })
    );
  });

  it("throws if API returns no text content", async () => {
    mockCreate.mockResolvedValue({ content: [{ type: "tool_use" }] });
    await expect(
      generateCaption({ apiKey: "k", fileName: "img.png", contentType: "image" })
    ).rejects.toThrow("No text content in Claude response");
  });
});
