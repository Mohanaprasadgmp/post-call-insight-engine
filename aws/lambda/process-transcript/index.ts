import {
  S3Client,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import {
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import type { S3Event } from "aws-lambda";
import { analyzeTranscript } from "./claude";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });
const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });

const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "CallInsights";

// Amazon Connect Contact Lens JSON shape
interface ContactLensTranscript {
  CustomerMetadata?: { ContactId?: string; InputS3Uri?: string };
  Transcript?: Array<{
    Id: string;
    ParticipantId: string; // "AGENT" | "CUSTOMER"
    Content: string;
    BeginOffsetMillis: number;
  }>;
  ConversationCharacteristics?: {
    TotalConversationDurationMillis?: number;
  };
}

// Amazon Connect .meta.json shape
interface ConnectMetaFile {
  Agent?: { Username?: string; ARN?: string };
  ContactId?: string;
  ContactDuration?: number; // seconds
  Tags?: Record<string, string>;
  InitiationTimestamp?: string;
}

interface ConnectMetadata {
  contactId: string;
  agentId: string;
  agentName: string;
  duration: number;
  timestamp: string;
  audioS3Key?: string;
  tags?: string[];
}

async function streamToString(stream: NodeJS.ReadableStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk: Buffer) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}

/**
 * Extracts readable transcript text from either:
 * - Amazon Connect Contact Lens JSON (detected by Transcript array)
 * - Plain text (.txt)
 */
function extractTranscriptText(raw: string, key: string): string {
  if (key.endsWith(".txt")) {
    return raw;
  }
  try {
    const parsed = JSON.parse(raw) as ContactLensTranscript;
    if (Array.isArray(parsed.Transcript) && parsed.Transcript.length > 0) {
      return parsed.Transcript
        .sort((a, b) => a.BeginOffsetMillis - b.BeginOffsetMillis)
        .map((t) => `${t.ParticipantId}: ${t.Content}`)
        .join("\n");
    }
  } catch {
    // Not JSON — treat as plain text
  }
  return raw;
}

/**
 * Parses Amazon Connect Contact Lens JSON for metadata
 * (contactId and duration can be embedded in the transcript file itself).
 */
function extractContactLensMetadata(
  raw: string
): Partial<{ contactId: string; duration: number }> {
  try {
    const parsed = JSON.parse(raw) as ContactLensTranscript;
    const contactId = parsed.CustomerMetadata?.ContactId;
    const durationMs =
      parsed.ConversationCharacteristics?.TotalConversationDurationMillis;
    return {
      contactId,
      duration: durationMs !== undefined ? Math.round(durationMs / 1000) : undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Maps an Amazon Connect .meta.json file to our ConnectMetadata shape.
 */
function parseConnectMetaFile(text: string, fallbackContactId: string): ConnectMetadata {
  try {
    const meta = JSON.parse(text) as ConnectMetaFile;
    const agentUsername = meta.Agent?.Username ?? "unknown";
    const tags = meta.Tags ? Object.entries(meta.Tags).map(([k, v]) => `${k}:${v}`) : [];
    return {
      contactId: meta.ContactId ?? fallbackContactId,
      agentId: agentUsername,
      agentName: agentUsername,
      duration: meta.ContactDuration ?? 0,
      timestamp: meta.InitiationTimestamp ?? new Date().toISOString(),
      tags,
    };
  } catch {
    return {
      contactId: fallbackContactId,
      agentId: "unknown",
      agentName: "Unknown Agent",
      duration: 0,
      timestamp: new Date().toISOString(),
      tags: [],
    };
  }
}

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing: s3://${bucket}/${key}`);

    // 1. Download transcript
    const transcriptObj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    const rawTranscript = await streamToString(
      transcriptObj.Body as NodeJS.ReadableStream
    );

    // 2. Extract readable text (handles Contact Lens JSON + plain text)
    const transcriptText = extractTranscriptText(rawTranscript, key);

    // 3. Pull any metadata embedded in the transcript file itself
    const embeddedMeta = extractContactLensMetadata(rawTranscript);

    // 4. Download the .meta.json sidecar (same key, extension replaced)
    const metaKey = key.replace(/\.(txt|json)$/, ".meta.json");
    const fallbackContactId =
      embeddedMeta.contactId ??
      key.split("/").pop()!.replace(/\.[^.]+$/, "");

    let metadata: ConnectMetadata;
    try {
      const metaObj = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: metaKey })
      );
      const metaText = await streamToString(metaObj.Body as NodeJS.ReadableStream);
      metadata = parseConnectMetaFile(metaText, fallbackContactId);
      // Prefer duration from Contact Lens if the meta file has none
      if (!metadata.duration && embeddedMeta.duration) {
        metadata.duration = embeddedMeta.duration;
      }
    } catch {
      // No sidecar — use embedded metadata or derive from key
      const parts = key.split("/");
      metadata = {
        contactId: fallbackContactId,
        agentId: "unknown",
        agentName: "Unknown Agent",
        duration: embeddedMeta.duration ?? 0,
        timestamp: new Date().toISOString(),
        tags: [],
      };
      // Include the S3 key segment that looks like a date or agent folder if present
      if (parts.length >= 2) {
        metadata.agentId = parts[parts.length - 2];
        metadata.agentName = parts[parts.length - 2];
      }
    }

    // 5. Analyze with Claude
    const insights = await analyzeTranscript(transcriptText);

    // 6. Write to DynamoDB
    const date = metadata.timestamp.substring(0, 10); // YYYY-MM-DD for GSI2
    const item = {
      callId: metadata.contactId,
      timestamp: metadata.timestamp,
      date,
      agentId: metadata.agentId,
      agentName: metadata.agentName,
      duration: metadata.duration,
      summary: insights.summary,
      agentScore: insights.agentScore,
      improvement: insights.improvement,
      keywords: insights.keywords,
      sentimentScore: insights.sentimentScore,
      sentiment: insights.sentiment,
      audioS3Key: metadata.audioS3Key ?? null,
      transcriptS3Key: key,
      tags: metadata.tags ?? [],
      processedAt: new Date().toISOString(),
    };

    await dynamo.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: marshall(item, { removeUndefinedValues: true }),
      })
    );

    console.log(`Written to DynamoDB: ${metadata.contactId}`);
  }
};
