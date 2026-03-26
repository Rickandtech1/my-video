// src/social/config.ts
import { execFileSync } from "child_process";

export function loadKey(serviceName: string): string {
  try {
    const raw = execFileSync(
      "security",
      ["find-generic-password", "-s", serviceName, "-w"],
      { encoding: "utf8" }
    );
    const trimmed = raw.trim();
    if (!trimmed) throw new Error(`Key ${serviceName} is empty`);
    return trimmed;
  } catch {
    throw new Error(`Could not load key "${serviceName}" from Keychain.\nRun: security add-generic-password -a "$USER" -s "${serviceName}" -w YOUR_VALUE`);
  }
}

export interface Config {
  composioApiKey: string;
  fbPageAccessToken: string;
  fbPageId: string;
  igUserId: string;
}

export function loadConfig(): Config {
  return {
    composioApiKey:     loadKey("COMPOSIO_API_KEY"),
    fbPageAccessToken:  loadKey("FB_PAGE_ACCESS_TOKEN"),
    fbPageId:           loadKey("FB_PAGE_ID"),
    igUserId:           loadKey("IG_USER_ID"),
  };
}
