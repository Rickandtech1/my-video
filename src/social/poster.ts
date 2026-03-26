// src/social/poster.ts
import { ComposioToolSet } from "composio-core";
import FormData from "form-data";
import fetch from "node-fetch";
import { QueueEntry, Platform } from "./queue";

interface PosterConfig {
  composioApiKey: string;
  fbPageAccessToken?: string;  // loaded from Keychain as FB_PAGE_ACCESS_TOKEN
  fbPageId?: string;           // loaded from Keychain as FB_PAGE_ID
}

export interface PostResult {
  platform: Platform;
  success: boolean;
  error?: string;
}

// Instagram: two-step via Composio (create container → publish)
async function postToInstagram(
  toolset: ComposioToolSet,
  igUserId: string,
  imageUrl: string,
  caption: string
): Promise<void> {
  const container = await toolset.executeAction({
    action: "INSTAGRAM_CREATE_MEDIA_CONTAINER",
    params: { ig_user_id: igUserId, image_url: imageUrl, caption, content_type: "photo" },
    entityId: "default",
  }) as { data?: { id?: string } };

  const creationId = container?.data?.id;
  if (!creationId) throw new Error("No creation_id returned from media container");

  await toolset.executeAction({
    action: "INSTAGRAM_CREATE_POST",
    params: { ig_user_id: igUserId, creation_id: creationId },
    entityId: "default",
  });
}

// Facebook: direct Graph API (Composio FB lacks pages_manage_posts)
async function postToFacebook(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption: string
): Promise<void> {
  const form = new FormData();
  form.append("url", imageUrl);
  form.append("caption", caption);
  form.append("access_token", pageAccessToken);

  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/photos`, {
    method: "POST",
    body: form,
  });
  const data = await res.json() as { id?: string; error?: { message: string } };
  if (!res.ok || data.error) {
    throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  }
}

export async function postContent(
  config: PosterConfig,
  entry: QueueEntry,
  igUserId: string
): Promise<PostResult[]> {
  const toolset = new ComposioToolSet({ apiKey: config.composioApiKey });
  const results: PostResult[] = [];

  for (const platform of entry.platforms) {
    try {
      if (platform === "instagram") {
        await postToInstagram(toolset, igUserId, entry.filePath, entry.captionDraft);
      } else if (platform === "facebook") {
        if (!config.fbPageAccessToken || !config.fbPageId) {
          throw new Error("FB_PAGE_ACCESS_TOKEN and FB_PAGE_ID required in Keychain");
        }
        await postToFacebook(config.fbPageId, config.fbPageAccessToken, entry.filePath, entry.captionDraft);
      } else if (platform === "threads") {
        await toolset.executeAction({
          action: "THREADS_CREATE_POST",
          params: { caption: entry.captionDraft, mediaUrl: entry.filePath },
          entityId: "default",
        });
      }
      results.push({ platform, success: true });
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      results.push({ platform, success: false, error });
    }
  }

  return results;
}
