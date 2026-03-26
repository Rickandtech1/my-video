// src/social/config.ts
import { execSync } from "child_process";

export function loadKey(serviceName: string): string {
  try {
    const result = execSync(
      `security find-generic-password -a "$USER" -s "${serviceName}" -w`,
      { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }
    );
    return result.toString().trim();
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
