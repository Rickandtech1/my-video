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
