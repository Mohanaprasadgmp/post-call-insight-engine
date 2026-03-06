export function buildPrompt(transcript: string): string {
  return `You are a call center quality analyst. Analyze the following call transcript and return ONLY valid JSON matching the schema below. No explanation, no markdown, no code fences.

Schema:
{
  "summary": ["<issue/customer intent>", "<outcome/resolution>", "<missed upsell, compliance flag, or opportunity>"],
  "agentScore": <integer 1-10>,
  "improvement": "<single specific, actionable improvement>",
  "keywords": ["<keyword1>", "<keyword2>"],
  "sentimentScore": <integer 0-100>,
  "sentiment": "<positive|neutral|negative>"
}

Rules:
- summary must be exactly 3 strings
- agentScore must be 1-10 (10 = perfect call)
- keywords: extract up to 10 relevant terms
- sentimentScore: 0 = extremely negative, 100 = extremely positive
- sentiment: derive from sentimentScore (0-39=negative, 40-69=neutral, 70-100=positive)

Transcript:
${transcript}`;
}
