// src/social/config.ts
import { execFileSync } from "child_process";

export function loadKey(serviceName: string): string {
  let raw: string;
  try {
    raw = execFileSync(
      "security",
      ["find-generic-password", "-a", process.env["USER"] ?? "", "-s", serviceName, "-w"],
      { encoding: "utf8" }
    );
  } catch {
    throw new Error(`Could not load key ${serviceName} from Keychain. Run: security add-generic-password -a "$USER" -s "${serviceName}" -w YOUR_KEY`);
  }
  const trimmed = raw.trim();
  if (!trimmed) throw new Error(`Key ${serviceName} exists in Keychain but is empty`);
  return trimmed;
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
