# Social Media Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a TypeScript CLI tool that discovers new content in `out/`, generates captions via Claude API, emails drafts for review, and posts to Instagram, Facebook, and Threads via Composio after approval.

**Architecture:** A pipeline of focused modules (`content → caption → queue → email → approve → post`) wired together by `pipeline.ts` and exposed as three CLI commands (`post`, `approve`, `schedule`) via `index.ts`. External API keys are loaded from macOS Keychain at runtime.

**Tech Stack:** TypeScript, Node.js, `composio-core`, `@anthropic-ai/sdk`, `nodemailer`, `node-cron`, `ts-node`, Jest + ts-jest

---

## File Map

| File | Responsibility |
|---|---|
| `src/social/config.ts` | Load API keys from macOS Keychain |
| `src/social/queue.ts` | Read/write `queue.json` and `processed.json` |
| `src/social/content.ts` | Scan `out/` for new files, detect content type |
| `src/social/caption.ts` | Call Claude API to generate caption drafts |
| `src/social/email.ts` | Send draft notification via Nodemailer + Gmail SMTP |
| `src/social/poster.ts` | Post to IG/FB/Threads via Composio SDK |
| `src/social/pipeline.ts` | Orchestrate full post and approve flows |
| `src/social/index.ts` | CLI entry point — parse args, run commands |
| `tests/social/queue.test.ts` | Queue CRUD tests |
| `tests/social/content.test.ts` | Content discovery tests |
| `tests/social/caption.test.ts` | Caption generation tests (mocked) |
| `tests/social/email.test.ts` | Email send tests (mocked) |
| `tests/social/poster.test.ts` | Composio posting tests (mocked) |
| `tests/social/pipeline.test.ts` | Pipeline integration tests |

---

## Task 1: Install Dependencies

**Files:**
- Modify: `package.json`
- Create: `jest.config.js`
- Modify: `.gitignore`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install composio-core @anthropic-ai/sdk nodemailer node-cron ts-node
```

Expected: packages added to `node_modules/`, `package-lock.json` updated.

- [ ] **Step 2: Install dev dependencies**

```bash
npm install --save-dev @types/nodemailer @types/node-cron @types/node jest ts-jest @types/jest
```

Expected: dev packages added.

- [ ] **Step 3: Create jest.config.js**

```js
// jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js", "json"],
};
```

- [ ] **Step 4: Add test script to package.json**

Add to the `"scripts"` section in `package.json`:

```json
"test": "jest",
"post": "ts-node src/social/index.ts post",
"approve": "ts-node src/social/index.ts approve",
"schedule": "ts-node src/social/index.ts schedule"
```

- [ ] **Step 5: Update .gitignore**

Add to `.gitignore` (create if it doesn't exist):

```
queue.json
processed.json
social.log
node_modules/
out/
```

- [ ] **Step 6: Verify TypeScript can see Node types**

```bash
npx ts-node -e "console.log('ok')"
```

Expected: prints `ok`. If error about `tsconfig`, add `"ts-node": { "esModuleInterop": true }` to `tsconfig.json`.

- [ ] **Step 7: Commit**

```bash
git add package.json jest.config.js .gitignore
git commit -m "chore: add social automation dependencies and jest config"
```

---

## Task 2: config.ts — Load Keys from macOS Keychain

**Files:**
- Create: `src/social/config.ts`
- Create: `tests/social/config.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/social/config.test.ts
import { execSync } from "child_process";
import { loadKey } from "../../src/social/config";

jest.mock("child_process");
const mockExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("loadKey", () => {
  it("returns trimmed key from keychain", () => {
    mockExecSync.mockReturnValue(Buffer.from("my-secret-key\n"));
    const result = loadKey("MY_SERVICE");
    expect(result).toBe("my-secret-key");
    expect(mockExecSync).toHaveBeenCalledWith(
      expect.stringContaining("MY_SERVICE"),
      expect.any(Object)
    );
  });

  it("throws if key not found", () => {
    mockExecSync.mockImplementation(() => { throw new Error("not found"); });
    expect(() => loadKey("MISSING_KEY")).toThrow(
      "Could not load key MISSING_KEY from Keychain"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/config.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/config'`

- [ ] **Step 3: Write implementation**

```ts
// src/social/config.ts
import { execSync } from "child_process";

export function loadKey(serviceName: string): string {
  try {
    const result = execSync(
      `security find-generic-password -a "$USER" -s "${serviceName}" -w`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    return result.trim();
  } catch {
    throw new Error(`Could not load key ${serviceName} from Keychain. Run: security add-generic-password -a "$USER" -s "${serviceName}" -w YOUR_KEY`);
  }
}

export interface Config {
  composioApiKey: string;
  anthropicApiKey: string;
  gmailAppPassword: string;
  gmailUser: string;
}

export function loadConfig(): Config {
  return {
    composioApiKey: loadKey("COMPOSIO_API_KEY"),
    anthropicApiKey: loadKey("ANTHROPIC_API_KEY"),
    gmailAppPassword: loadKey("GMAIL_APP_PASSWORD"),
    gmailUser: loadKey("GMAIL_USER"),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- tests/social/config.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/config.ts tests/social/config.test.ts
git commit -m "feat: add config module to load keys from macOS Keychain"
```

---

## Task 3: queue.ts — Queue CRUD

**Files:**
- Create: `src/social/queue.ts`
- Create: `tests/social/queue.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
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
  QueueEntry,
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
    const updated = getQueue().find((e) => e.id === entry.id);
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/queue.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/queue'`

- [ ] **Step 3: Write implementation**

```ts
// src/social/queue.ts
import fs from "fs";
import path from "path";
import crypto from "crypto";

const QUEUE_PATH = path.resolve("queue.json");
const PROCESSED_PATH = path.resolve("processed.json");

export type Platform = "instagram" | "facebook" | "threads";
export type QueueStatus = "pending" | "approved" | "edited" | "posted" | "failed" | "rejected";

export interface QueueEntry {
  id: string;
  createdAt: string;
  status: QueueStatus;
  contentType: "video" | "image" | "carousel";
  filePath: string;
  captionDraft: string;
  platforms: Platform[];
  emailSentAt?: string;
  postedAt?: string;
  failureReason?: string;
}

export function getQueue(): QueueEntry[] {
  if (!fs.existsSync(QUEUE_PATH)) return [];
  return JSON.parse(fs.readFileSync(QUEUE_PATH, "utf8")) as QueueEntry[];
}

function saveQueue(queue: QueueEntry[]): void {
  fs.writeFileSync(QUEUE_PATH, JSON.stringify(queue, null, 2));
}

export function addToQueue(
  data: Pick<QueueEntry, "contentType" | "filePath" | "captionDraft" | "platforms">
): QueueEntry {
  const queue = getQueue();
  const entry: QueueEntry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...data,
  };
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

export function updateEntry(id: string, updates: Partial<QueueEntry>): void {
  const queue = getQueue();
  const idx = queue.findIndex((e) => e.id === id);
  if (idx === -1) throw new Error(`Queue entry ${id} not found`);
  queue[idx] = { ...queue[idx], ...updates };
  saveQueue(queue);
}

export function removeEntry(id: string): void {
  const queue = getQueue().filter((e) => e.id !== id);
  saveQueue(queue);
}

export function markProcessed(filePath: string): void {
  const list = getProcessed();
  list.push(filePath);
  fs.writeFileSync(PROCESSED_PATH, JSON.stringify(list, null, 2));
}

export function isProcessed(filePath: string): boolean {
  return getProcessed().includes(filePath);
}

function getProcessed(): string[] {
  if (!fs.existsSync(PROCESSED_PATH)) return [];
  return JSON.parse(fs.readFileSync(PROCESSED_PATH, "utf8")) as string[];
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/queue.test.ts
```

Expected: PASS (all 5 tests)

- [ ] **Step 5: Commit**

```bash
git add src/social/queue.ts tests/social/queue.test.ts
git commit -m "feat: add queue module for pending posts"
```

---

## Task 4: content.ts — Scan out/ for New Content

**Files:**
- Create: `src/social/content.ts`
- Create: `tests/social/content.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/social/content.test.ts
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
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.fileName)).toContain("video.mp4");
    expect(items.map((i) => i.fileName)).toContain("image.png");
  });

  it("returns correct contentType per file", () => {
    const video = discoverContent().find((i) => i.fileName === "video.mp4");
    expect(video?.contentType).toBe("video");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/content.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/content'`

- [ ] **Step 3: Write implementation**

```ts
// src/social/content.ts
import fs from "fs";
import path from "path";
import { isProcessed } from "./queue";

export interface ContentItem {
  filePath: string;
  fileName: string;
  contentType: "video" | "image" | "carousel";
}

const SUPPORTED_EXTENSIONS = [".mp4", ".png", ".jpg", ".jpeg"];
const OUT_DIR = path.resolve("out");

export function detectContentType(filePath: string): "video" | "image" | "carousel" {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".mp4") return "video";
  return "image";
}

export function discoverContent(): ContentItem[] {
  if (!fs.existsSync(OUT_DIR)) return [];

  return fs
    .readdirSync(OUT_DIR)
    .filter((file) => SUPPORTED_EXTENSIONS.includes(path.extname(file).toLowerCase()))
    .map((file) => path.join(OUT_DIR, file))
    .filter((filePath) => !isProcessed(filePath))
    .map((filePath) => ({
      filePath,
      fileName: path.basename(filePath),
      contentType: detectContentType(filePath),
    }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/content.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/content.ts tests/social/content.test.ts
git commit -m "feat: add content discovery module"
```

---

## Task 5: caption.ts — Claude API Caption Generation

**Files:**
- Create: `src/social/caption.ts`
- Create: `tests/social/caption.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/social/caption.test.ts
import { generateCaption } from "../../src/social/caption";

const mockCreate = jest.fn();
jest.mock("@anthropic-ai/sdk", () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}));

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
        model: expect.stringContaining("claude"),
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/caption.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/caption'`

- [ ] **Step 3: Write implementation**

```ts
// src/social/caption.ts
import Anthropic from "@anthropic-ai/sdk";

interface CaptionInput {
  apiKey: string;
  fileName: string;
  contentType: "video" | "image" | "carousel";
}

export async function generateCaption(input: CaptionInput): Promise<string> {
  const client = new Anthropic({ apiKey: input.apiKey });

  const prompt = `Generate an engaging social media caption for a ${input.contentType} named "${input.fileName}".
Requirements:
- Under 150 words
- Conversational and authentic tone
- Include 3-5 relevant hashtags at the end
- Use 1-2 emojis naturally (not at every line)
- Do not use generic phrases like "Check this out"
Return only the caption text, nothing else.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text content in Claude response");
  }
  return textBlock.text.trim();
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/caption.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/caption.ts tests/social/caption.test.ts
git commit -m "feat: add caption generation via Claude API"
```

---

## Task 6: email.ts — Draft Notification via Nodemailer

**Files:**
- Create: `src/social/email.ts`
- Create: `tests/social/email.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// tests/social/email.test.ts
import { sendDraftEmail, EmailConfig } from "../../src/social/email";
import { QueueEntry } from "../../src/social/queue";

const mockSendMail = jest.fn().mockResolvedValue({ messageId: "test-id" });
jest.mock("nodemailer", () => ({
  createTransport: jest.fn().mockReturnValue({ sendMail: mockSendMail }),
}));

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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/email.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/email'`

- [ ] **Step 3: Write implementation**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/email.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/email.ts tests/social/email.test.ts
git commit -m "feat: add email notification module via Nodemailer"
```

---

## Task 7: poster.ts — Post via Composio SDK

**Files:**
- Create: `src/social/poster.ts`
- Create: `tests/social/poster.test.ts`

> **Note:** Before running for real, authenticate each platform in the Composio dashboard at https://app.composio.dev and connect Instagram, Facebook, and Threads under your account.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/social/poster.test.ts
import { postContent, PostResult } from "../../src/social/poster";
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/poster.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/poster'`

- [ ] **Step 3: Write implementation**

```ts
// src/social/poster.ts
import { ComposioToolSet } from "composio-core";
import { QueueEntry, Platform } from "./queue";

interface PosterConfig {
  apiKey: string;
}

export interface PostResult {
  platform: Platform;
  success: boolean;
  error?: string;
}

const PLATFORM_ACTIONS: Record<Platform, string> = {
  instagram: "INSTAGRAM_CREATE_POST",
  facebook: "FACEBOOK_CREATE_POST",
  threads: "THREADS_CREATE_POST",
};

export async function postContent(
  config: PosterConfig,
  entry: QueueEntry
): Promise<PostResult[]> {
  const toolset = new ComposioToolSet({ apiKey: config.apiKey });
  const results: PostResult[] = [];

  for (const platform of entry.platforms) {
    try {
      await toolset.executeAction({
        action: PLATFORM_ACTIONS[platform],
        params: {
          caption: entry.captionDraft,
          mediaUrl: entry.filePath,
        },
        entityId: "default",
      });
      results.push({ platform, success: true });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ platform, success: false, error });
    }
  }

  return results;
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/poster.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/poster.ts tests/social/poster.test.ts
git commit -m "feat: add Composio poster module for IG/FB/Threads"
```

---

## Task 8: pipeline.ts — Orchestrate Full Flow

**Files:**
- Create: `src/social/pipeline.ts`
- Create: `tests/social/pipeline.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- tests/social/pipeline.test.ts
```

Expected: FAIL — `Cannot find module '../../src/social/pipeline'`

- [ ] **Step 3: Write implementation**

```ts
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
      log(`✓ Posted to all platforms`);
    } else {
      const failedPlatforms = failures.map((f) => `${f.platform}: ${f.error}`).join(", ");
      updateEntry(entry.id, { status: "failed", failureReason: failedPlatforms });
      log(`✗ Failed on: ${failedPlatforms}`);
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- tests/social/pipeline.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/social/pipeline.ts tests/social/pipeline.test.ts
git commit -m "feat: add pipeline orchestrator for post and approve flows"
```

---

## Task 9: index.ts — CLI Entry Point + Interactive Approval

**Files:**
- Create: `src/social/index.ts`

> No unit test for index.ts — it is a thin CLI shell. Test manually.

- [ ] **Step 1: Write implementation**

```ts
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
```

- [ ] **Step 2: Manual smoke test — dry run**

```bash
# Make sure out/ has at least one file first:
touch out/test-video.mp4

# Then run (will fail on real API calls, but should reach that point):
npm run post 2>&1 | head -20
```

Expected: Logs attempt to load Keychain keys. If keys aren't set yet, you'll see the Keychain error message with instructions to add them.

- [ ] **Step 3: Commit**

```bash
git add src/social/index.ts
git commit -m "feat: add CLI entry point with interactive approve flow and cron scheduler"
```

---

## Task 10: Store API Keys in Keychain + End-to-End Test

**Files:** None (runtime setup)

- [ ] **Step 1: Store COMPOSIO_API_KEY in Keychain**

```bash
security add-generic-password -a "$USER" -s "COMPOSIO_API_KEY" -w YOUR_COMPOSIO_KEY
```

- [ ] **Step 2: Store ANTHROPIC_API_KEY in Keychain**

```bash
security add-generic-password -a "$USER" -s "ANTHROPIC_API_KEY" -w YOUR_ANTHROPIC_KEY
```

- [ ] **Step 3: Store Gmail credentials in Keychain**

```bash
security add-generic-password -a "$USER" -s "GMAIL_APP_PASSWORD" -w YOUR_GMAIL_APP_PASSWORD
security add-generic-password -a "$USER" -s "GMAIL_USER" -w your@gmail.com
```

> Get a Gmail App Password at: Google Account → Security → 2-Step Verification → App Passwords

- [ ] **Step 4: Connect platforms in Composio dashboard**

Go to https://app.composio.dev → Integrations → connect Instagram, Facebook, and Threads to your account.

- [ ] **Step 5: End-to-end test**

```bash
# Add a real file to out/
cp any-image.png out/test-post.png

# Run the pipeline
npm run post
```

Expected: Email arrives in your inbox with caption draft. Then run:

```bash
npm run approve
```

Expected: Interactive prompt shows the pending post. Approve it — it should post to all three platforms.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete social media automation CLI — post, approve, schedule"
```

---

## Running All Tests

```bash
npm test
```

Expected: All tests pass across config, queue, content, caption, email, poster, and pipeline modules.
