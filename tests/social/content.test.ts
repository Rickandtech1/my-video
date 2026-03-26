import fs from "fs";
import path from "path";
import { discoverContent, detectContentType, ContentItem } from "../../src/social/content";

jest.mock("../../src/social/queue", () => ({
  isProcessed: jest.fn((p: string) => p.includes("processed")),
}));

describe("detectContentType", () => {
  it("returns video for .mp4 files", () => {
    expect(detectContentType("out/clip.mp4")).toBe("video");
  });

  it("returns image for .png and .jpg files", () => {
    expect(detectContentType("out/photo.png")).toBe("image");
    expect(detectContentType("out/photo.jpg")).toBe("image");
  });
});

describe("discoverContent", () => {
  const outDir = path.resolve("out");

  beforeEach(() => {
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, "video.mp4"), "");
    fs.writeFileSync(path.join(outDir, "image.png"), "");
    fs.writeFileSync(path.join(outDir, "processed-file.mp4"), "");
  });

  afterEach(() => {
    ["video.mp4", "image.png", "processed-file.mp4"].forEach((f) => {
      const p = path.join(outDir, f);
      if (fs.existsSync(p)) fs.unlinkSync(p);
    });
  });

  it("returns unprocessed files only", () => {
    const items = discoverContent();
    const fileNames = items.map((i) => i.fileName);
    // Should include the unprocessed test files
    expect(fileNames).toContain("video.mp4");
    expect(fileNames).toContain("image.png");
    // Should NOT include the processed file
    expect(fileNames).not.toContain("processed-file.mp4");
  });

  it("returns correct contentType per file", () => {
    const video = discoverContent().find((i) => i.fileName === "video.mp4");
    expect(video?.contentType).toBe("video");
  });
});

// Suppress unused import warning — ContentItem is used as a type reference
const _unused: ContentItem | undefined = undefined;
void _unused;
