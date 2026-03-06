import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
  ScanCommand,
  type QueryCommandInput,
  type ScanCommandInput,
  type AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
// Local type definitions (mirrors src/lib/types.ts — keep in sync)
interface SentimentByDay {
  date: string;
  sentimentScore: number;
  callCount: number;
}

interface ScoreByAgent {
  agentId: string;
  agentName: string;
  avgScore: number;
  callCount: number;
  avgSentiment: number;
}

interface KeywordFrequency {
  keyword: string;
  count: number;
}

interface CategoryBreakdown {
  category: string;
  count: number;
}

interface AnalyticsResponse {
  sentimentByDay: SentimentByDay[];
  scoreByAgent: ScoreByAgent[];
  topKeywords: KeywordFrequency[];
  categories: CategoryBreakdown[];
}

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "CallInsights";

// ---------- helpers ----------

function response(statusCode: number, body: unknown): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(body),
  };
}

function encodeCursor(key: Record<string, unknown>): string {
  return Buffer.from(JSON.stringify(key)).toString("base64");
}

function decodeCursor(cursor: string): Record<string, unknown> | undefined {
  try {
    return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

// ---------- analytics aggregation ----------

interface RawItem {
  agentId?: string;
  agentName?: string;
  timestamp?: string;
  date?: string;
  agentScore?: number;
  sentimentScore?: number;
  keywords?: string[];
  summary?: string[];
  [key: string]: unknown;
}

/**
 * Pure function — computes all analytics from a flat array of call records.
 * Testable in isolation without DynamoDB.
 */
export function buildAnalytics(items: RawItem[]): AnalyticsResponse {
  // sentimentByDay
  const byDay = new Map<string, { total: number; count: number }>();
  for (const item of items) {
    const date = item.date ?? item.timestamp?.substring(0, 10) ?? "unknown";
    const score = item.sentimentScore ?? 0;
    const existing = byDay.get(date) ?? { total: 0, count: 0 };
    byDay.set(date, { total: existing.total + score, count: existing.count + 1 });
  }
  const sentimentByDay: SentimentByDay[] = Array.from(byDay.entries())
    .map(([date, { total, count }]) => ({
      date,
      sentimentScore: Math.round(total / count),
      callCount: count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // scoreByAgent
  const byAgent = new Map<
    string,
    { agentName: string; scoreTotal: number; sentimentTotal: number; count: number }
  >();
  for (const item of items) {
    const id = item.agentId ?? "unknown";
    const existing = byAgent.get(id) ?? {
      agentName: item.agentName ?? id,
      scoreTotal: 0,
      sentimentTotal: 0,
      count: 0,
    };
    byAgent.set(id, {
      agentName: existing.agentName,
      scoreTotal: existing.scoreTotal + (item.agentScore ?? 0),
      sentimentTotal: existing.sentimentTotal + (item.sentimentScore ?? 0),
      count: existing.count + 1,
    });
  }
  const scoreByAgent: ScoreByAgent[] = Array.from(byAgent.entries())
    .map(([agentId, { agentName, scoreTotal, sentimentTotal, count }]) => ({
      agentId,
      agentName,
      avgScore: Math.round((scoreTotal / count) * 10) / 10,
      callCount: count,
      avgSentiment: Math.round(sentimentTotal / count),
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // topKeywords
  const kwCount = new Map<string, number>();
  for (const item of items) {
    for (const kw of item.keywords ?? []) {
      kwCount.set(kw, (kwCount.get(kw) ?? 0) + 1);
    }
  }
  const topKeywords: KeywordFrequency[] = Array.from(kwCount.entries())
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // categories — derived from the first word of the first summary bullet
  const catCount = new Map<string, number>();
  for (const item of items) {
    const firstBullet = item.summary?.[0] ?? "";
    const category = firstBullet.split(" ")[0] || "Other";
    catCount.set(category, (catCount.get(category) ?? 0) + 1);
  }
  const categories: CategoryBreakdown[] = Array.from(catCount.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  return { sentimentByDay, scoreByAgent, topKeywords, categories };
}

// ---------- Lambda handler ----------

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const path = event.path;
  const method = event.httpMethod;
  const params = event.queryStringParameters ?? {};

  if (method !== "GET") {
    return response(405, { error: "Method not allowed" });
  }

  // GET /calls/{id}
  const detailMatch = path.match(/^\/calls\/(.+)$/);
  if (detailMatch) {
    const callId = detailMatch[1];
    const result = await dynamo.send(
      new GetItemCommand({
        TableName: TABLE_NAME,
        Key: { callId: { S: callId } },
      })
    );
    if (!result.Item) return response(404, { error: "Not found" });
    return response(200, unmarshall(result.Item));
  }

  // GET /calls
  if (path === "/calls") {
    const {
      agentId,
      from = "1970-01-01T00:00:00Z",
      to = "2099-12-31T23:59:59Z",
      sentiment,
      minScore,
      limit = "10",
      cursor,
    } = params;

    const limitNum = Math.min(parseInt(limit, 10), 100);
    const exclusiveStartKey = cursor ? decodeCursor(cursor) : undefined;

    let items: Record<string, unknown>[];
    let nextCursor: string | undefined;

    if (agentId) {
      // Query GSI1: agentId (PK) + timestamp BETWEEN from..to
      const input: QueryCommandInput = {
        TableName: TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "agentId = :a AND #ts BETWEEN :from AND :to",
        ExpressionAttributeNames: { "#ts": "timestamp" },
        ExpressionAttributeValues: {
          ":a": { S: agentId },
          ":from": { S: from },
          ":to": { S: to },
        },
        ScanIndexForward: false,
        Limit: limitNum,
        ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey as never }),
      };

      // Apply optional filter expressions
      const filterParts: string[] = [];
      if (sentiment) {
        input.ExpressionAttributeValues![":sentiment"] = { S: sentiment };
        filterParts.push("sentiment = :sentiment");
      }
      if (minScore) {
        input.ExpressionAttributeValues![":minScore"] = { N: minScore };
        filterParts.push("agentScore >= :minScore");
      }
      if (filterParts.length > 0) {
        input.FilterExpression = filterParts.join(" AND ");
      }

      const result = await dynamo.send(new QueryCommand(input));
      items = (result.Items ?? []).map((item) => unmarshall(item));
      if (result.LastEvaluatedKey) {
        nextCursor = encodeCursor(unmarshall(result.LastEvaluatedKey));
      }
    } else {
      // Scan with FilterExpression for date range + optional filters
      const input: ScanCommandInput = {
        TableName: TABLE_NAME,
        Limit: limitNum,
        ...(exclusiveStartKey && { ExclusiveStartKey: exclusiveStartKey as never }),
      };

      const filterParts: string[] = ["#ts BETWEEN :from AND :to"];
      const exprNames: Record<string, string> = { "#ts": "timestamp" };
      const exprValues: Record<string, AttributeValue> = {
        ":from": { S: from },
        ":to": { S: to },
      };

      if (sentiment) {
        exprValues[":sentiment"] = { S: sentiment };
        filterParts.push("sentiment = :sentiment");
      }
      if (minScore) {
        exprValues[":minScore"] = { N: minScore };
        filterParts.push("agentScore >= :minScore");
      }

      input.FilterExpression = filterParts.join(" AND ");
      input.ExpressionAttributeNames = exprNames;
      input.ExpressionAttributeValues = exprValues;

      const result = await dynamo.send(new ScanCommand(input));
      items = (result.Items ?? []).map((item) => unmarshall(item));
      if (result.LastEvaluatedKey) {
        nextCursor = encodeCursor(unmarshall(result.LastEvaluatedKey));
      }
    }

    return response(200, {
      calls: items,
      total: items.length,
      nextCursor,
    });
  }

  // GET /analytics
  if (path === "/analytics") {
    const {
      from = "1970-01-01T00:00:00Z",
      to = "2099-12-31T23:59:59Z",
      agentId,
    } = params;

    // Scan all records in the date range (no limit — analytics needs the full dataset)
    let items: RawItem[] = [];
    let lastKey: Record<string, unknown> | undefined;

    do {
      const input: ScanCommandInput = {
        TableName: TABLE_NAME,
        FilterExpression: "#ts BETWEEN :from AND :to",
        ExpressionAttributeNames: { "#ts": "timestamp" },
        ExpressionAttributeValues: {
          ":from": { S: from },
          ":to": { S: to },
        },
        ...(lastKey && { ExclusiveStartKey: lastKey as never }),
      };

      if (agentId) {
        input.FilterExpression += " AND agentId = :agentId";
        input.ExpressionAttributeValues![":agentId"] = { S: agentId };
      }

      const result = await dynamo.send(new ScanCommand(input));
      items = items.concat((result.Items ?? []).map((item) => unmarshall(item)) as RawItem[]);
      lastKey = result.LastEvaluatedKey
        ? (unmarshall(result.LastEvaluatedKey) as Record<string, unknown>)
        : undefined;
    } while (lastKey);

    return response(200, buildAnalytics(items));
  }

  return response(404, { error: "Not found" });
};
