// tests/social/queue.test.ts
import fs from "fs";
import path from "path";
import {
  addToQueue,
  getQueue,
  updateEntry,
  removeEntry,
  markProcessed,
  isProcessed,
  type QueueEntry,
} from "../../src/social/queue";

const QUEUE_PATH = path.resolve("queue.json");
const PROCESSED_PATH = path.resolve("processed.json");

beforeEach(() => {
  if (fs.existsSync(QUEUE_PATH)) fs.unlinkSync(QUEUE_PATH);
  if (fs.existsSync(PROCESSED_PATH)) fs.unlinkSync(PROCESSED_PATH);
});

afterEach(() => {
  if (fs.existsSync(QUEUE_PATH)) fs.unlinkSync(QUEUE_PATH);
  if (fs.existsSync(PROCESSED_PATH)) fs.unlinkSync(PROCESSED_PATH);
});

describe("addToQueue", () => {
  it("creates queue.json and adds an entry", () => {
    const entry = addToQueue({
      contentType: "video",
      filePath: "out/test.mp4",
      captionDraft: "Test caption",
      platforms: ["instagram", "facebook", "threads"],
    });
    expect(entry.id).toBeDefined();
    expect(entry.status).toBe("pending");
    const queue = getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].filePath).toBe("out/test.mp4");
  });
});

describe("updateEntry", () => {
  it("updates status of an existing entry", () => {
    const entry = addToQueue({
      contentType: "image",
      filePath: "out/img.png",
      captionDraft: "caption",
      platforms: ["instagram"],
    });
    updateEntry(entry.id, { status: "approved", captionDraft: "edited caption" });
    const updated: QueueEntry | undefined = getQueue().find((e) => e.id === entry.id);
    expect(updated?.status).toBe("approved");
    expect(updated?.captionDraft).toBe("edited caption");
  });
});

describe("removeEntry", () => {
  it("removes an entry from the queue", () => {
    const entry = addToQueue({
      contentType: "image",
      filePath: "out/img2.png",
      captionDraft: "caption",
      platforms: ["threads"],
    });
    removeEntry(entry.id);
    expect(getQueue()).toHaveLength(0);
  });
});

describe("markProcessed / isProcessed", () => {
  it("tracks processed file paths", () => {
    expect(isProcessed("out/foo.mp4")).toBe(false);
    markProcessed("out/foo.mp4");
    expect(isProcessed("out/foo.mp4")).toBe(true);
  });
});
