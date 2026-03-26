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
