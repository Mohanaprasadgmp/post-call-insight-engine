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

export const handler = async (event: S3Event): Promise<void> => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));

    console.log(`Processing: s3://${bucket}/${key}`);

    // 1. Download transcript
    const transcriptObj = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );
    const transcriptText = await streamToString(
      transcriptObj.Body as NodeJS.ReadableStream
    );

    // 2. Download metadata (convention: same key but .meta.json extension)
    const metaKey = key.replace(/\.txt$/, ".meta.json").replace(/\.json$/, ".meta.json");
    let metadata: ConnectMetadata;
    try {
      const metaObj = await s3.send(
        new GetObjectCommand({ Bucket: bucket, Key: metaKey })
      );
      const metaText = await streamToString(metaObj.Body as NodeJS.ReadableStream);
      metadata = JSON.parse(metaText) as ConnectMetadata;
    } catch {
      // Fallback metadata derived from key path if .meta.json not found
      const parts = key.split("/");
      metadata = {
        contactId: parts[parts.length - 1].replace(/\.[^.]+$/, ""),
        agentId: "unknown",
        agentName: "Unknown Agent",
        duration: 0,
        timestamp: new Date().toISOString(),
        tags: [],
      };
    }

    // 3. Analyze with Claude
    const insights = await analyzeTranscript(transcriptText);

    // 4. Write to DynamoDB
    const item = {
      callId: metadata.contactId,
      timestamp: metadata.timestamp,
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
