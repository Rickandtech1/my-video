// src/social/poster.ts
// Posts an image + caption to Instagram and/or Facebook.
// Instagram: Composio two-step (create container → publish)
// Facebook:  Direct Graph API (Composio lacks pages_manage_posts)

import { ComposioToolSet } from "composio-core";
import { Config } from "./config";

export interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

async function postToInstagram(
  toolset: ComposioToolSet,
  igUserId: string,
  imageUrl: string,
  caption: string
): Promise<string> {
  const container = await toolset.executeAction({
    action: "INSTAGRAM_CREATE_MEDIA_CONTAINER",
    params: { ig_user_id: igUserId, image_url: imageUrl, caption, content_type: "photo" },
    entityId: "default",
  }) as { data?: { id?: string } };

  const creationId = container?.data?.id;
  if (!creationId) throw new Error("No creation_id from media container");

  const post = await toolset.executeAction({
    action: "INSTAGRAM_CREATE_POST",
    params: { ig_user_id: igUserId, creation_id: creationId },
    entityId: "default",
  }) as { data?: { id?: string } };

  return post?.data?.id ?? "unknown";
}

async function postToFacebook(
  pageId: string,
  pageToken: string,
  imageUrl: string,
  caption: string
): Promise<string> {
  const params = new URLSearchParams({ url: imageUrl, caption, access_token: pageToken });
  const res = await fetch(`https://graph.facebook.com/v20.0/${pageId}/photos`, {
    method: "POST",
    body: params,
  });
  const data = await res.json() as { id?: string; post_id?: string; error?: { message: string } };
  if (!res.ok || data.error) throw new Error(data.error?.message ?? `HTTP ${res.status}`);
  return data.post_id ?? data.id ?? "unknown";
}

export async function post(
  config: Config,
  imageUrl: string,
  caption: string,
  platforms: ("instagram" | "facebook")[] = ["instagram", "facebook"]
): Promise<PostResult[]> {
  const toolset = new ComposioToolSet({ apiKey: config.composioApiKey });
  const results: PostResult[] = [];

  for (const platform of platforms) {
    try {
      let postId: string;
      if (platform === "instagram") {
        postId = await postToInstagram(toolset, config.igUserId, imageUrl, caption);
      } else {
        postId = await postToFacebook(config.fbPageId, config.fbPageAccessToken, imageUrl, caption);
      }
      results.push({ platform, success: true, postId });
    } catch (err) {
      results.push({ platform, success: false, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return results;
}
