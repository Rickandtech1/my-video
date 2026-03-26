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
