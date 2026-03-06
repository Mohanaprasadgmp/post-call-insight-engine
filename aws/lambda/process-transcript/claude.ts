import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt } from "./prompt";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ClaudeInsights {
  summary: [string, string, string];
  agentScore: number;
  improvement: string;
  keywords: string[];
  sentimentScore: number;
  sentiment: "positive" | "neutral" | "negative";
}

export async function analyzeTranscript(
  transcript: string
): Promise<ClaudeInsights> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: buildPrompt(transcript),
      },
    ],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  const parsed = JSON.parse(text) as ClaudeInsights;

  // Validate schema
  if (
    !Array.isArray(parsed.summary) ||
    parsed.summary.length !== 3 ||
    typeof parsed.agentScore !== "number" ||
    parsed.agentScore < 1 ||
    parsed.agentScore > 10 ||
    typeof parsed.improvement !== "string" ||
    !Array.isArray(parsed.keywords) ||
    typeof parsed.sentimentScore !== "number" ||
    !["positive", "neutral", "negative"].includes(parsed.sentiment)
  ) {
    throw new Error("Claude returned invalid schema: " + text);
  }

  return parsed;
}
