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
