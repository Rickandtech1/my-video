# Social Media Automation Design

**Date:** 2026-03-25
**Project:** my-video (Remotion)
**Goal:** Automate posting videos, images, and carousels to Instagram, Facebook, and Threads via Composio.dev

---

## Overview

A TypeScript CLI tool built into the existing Remotion project that:
1. Detects new content in `out/` (Remotion renders, FLUX images, carousels)
2. Generates caption drafts via Claude API
3. Emails the draft to the user for review
4. Posts to IG, FB, and Threads via Composio JS SDK after approval

---

## Architecture

```
Remotion render / FLUX image
         ↓
   Content Discovery
   (watches out/ folder)
         ↓
   Caption Generator
   (Claude API drafts caption)
         ↓
   Pending Queue
   (queue.json — stores draft + token)
         ↓
   Email Notification
   (sends draft to user email for review)
         ↓
   Approval Step
   (npm run approve — interactive CLI)
         ↓
   Composio Poster
   (posts to IG + FB + Threads via Composio JS SDK)
```

---

## File Structure

```
src/
  social/
    index.ts          ← CLI entry point
    pipeline.ts       ← Orchestrates the full flow
    content.ts        ← Scans out/ for new content, tracks processed files
    caption.ts        ← Calls Claude API to generate caption drafts
    email.ts          ← Sends draft notification via Nodemailer (Gmail SMTP)
    queue.ts          ← Reads/writes queue.json
    poster.ts         ← Posts to IG, FB, Threads via Composio SDK
    config.ts         ← Loads all API keys from macOS Keychain

queue.json            ← Pending posts (gitignored)
processed.json        ← Already-queued file paths (gitignored)
social.log            ← Action log with timestamps (gitignored)
```

---

## CLI Commands

Added to `package.json`:

```json
"post":     "ts-node src/social/index.ts post",
"approve":  "ts-node src/social/index.ts approve",
"schedule": "ts-node src/social/index.ts schedule"
```

- `npm run post` — scan for new content, generate captions, email drafts
- `npm run approve` — interactive approval: approve/edit/reject pending posts
- `npm run schedule` — start cron daemon (runs `post` daily at 9am by default)

---

## Queue Schema

Each entry in `queue.json`:

```json
{
  "id": "abc123",
  "createdAt": "2026-03-25T09:00:00Z",
  "status": "pending",
  "contentType": "video | image | carousel",
  "filePath": "out/my-video.mp4",
  "captionDraft": "🎬 Check out our latest...",
  "platforms": ["instagram", "facebook", "threads"],
  "emailSentAt": "2026-03-25T09:01:00Z"
}
```

**Status lifecycle:**
```
pending → approved → posted
        → edited   → posted
        → rejected (removed from queue)
        → failed   (retryable)
```

---

## Email Notification

Sent via Nodemailer + Gmail SMTP. Format:

```
Subject: [Draft] New post ready for review — my-video.mp4

Content: out/my-video.mp4
Platforms: Instagram, Facebook, Threads

--- Caption Draft ---
🎬 Check out our latest creation! [generated caption]

---
Run `npm run approve` in Claude Code to approve, edit, or reject.
```

---

## Approval Flow

Interactive CLI session via `npm run approve`:

```
📬 3 posts pending approval

[1] my-video.mp4 (video) — Instagram, Facebook, Threads
    Caption: "🎬 Check out our latest..."
    (a) Approve  (e) Edit caption  (r) Reject
> a
✓ Queued for posting
```

---

## Composio Integration

- SDK: `@composio-core/sdk` (JS)
- Actions used:
  - `INSTAGRAM_CREATE_POST`
  - `FACEBOOK_CREATE_POST`
  - `THREADS_CREATE_POST`
- One call per platform per post
- API key stored in macOS Keychain as `COMPOSIO_API_KEY`

---

## API Keys (all in macOS Keychain)

| Key name         | Used for              |
|------------------|-----------------------|
| `COMPOSIO_API_KEY` | Composio SDK auth   |
| `HF_TOKEN`       | FLUX image generation |
| `GMAIL_APP_PASSWORD` | Email via Nodemailer |
| `ANTHROPIC_API_KEY` | Claude caption API |

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Composio auth expired | Print re-auth instructions, skip post (kept in queue) |
| Platform rate limit | Retry once after 60s, then mark `failed` |
| File not found at post time | Log warning, skip post |
| Duplicate content | `processed.json` prevents re-queuing |
| Email send fails | Post stays in queue, prints warning |
| Partial platform failure | Log which platforms succeeded/failed, failed ones retryable |

---

## Dependencies to Add

```
@composio-core/sdk
nodemailer
node-cron
ts-node (already likely present)
@anthropic-ai/sdk
```

---

## Out of Scope

- Web dashboard UI
- Telegram/Discord approval bot
- Multi-account support
- Analytics / engagement tracking
