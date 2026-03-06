import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const dynamo = new DynamoDBClient({ region: process.env.AWS_REGION ?? "us-east-1" });
const TABLE_NAME = process.env.DYNAMODB_TABLE ?? "CallInsights";

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
        Key: {
          callId: { S: callId },
        },
      })
    );
    if (!result.Item) return response(404, { error: "Not found" });
    return response(200, unmarshall(result.Item));
  }

  // GET /calls
  if (path === "/calls") {
    const { agentId, from, to, sentiment, minScore, page = "1", limit = "10" } = params;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    let items: Record<string, unknown>[] = [];

    if (agentId) {
      // Use GSI1: agentId + timestamp
      const result = await dynamo.send(
        new QueryCommand({
          TableName: TABLE_NAME,
          IndexName: "GSI1",
          KeyConditionExpression: "agentId = :agentId",
          ExpressionAttributeValues: {
            ":agentId": { S: agentId },
          },
          ScanIndexForward: false,
        })
      );
      items = (result.Items ?? []).map(unmarshall);
    } else {
      // Full scan (in production, paginate properly)
      const result = await dynamo.send(
        new ScanCommand({ TableName: TABLE_NAME })
      );
      items = (result.Items ?? []).map(unmarshall);
    }

    // Apply filters
    if (from) items = items.filter((i) => (i.timestamp as string) >= from);
    if (to) items = items.filter((i) => (i.timestamp as string) <= to + "T23:59:59Z");
    if (sentiment) items = items.filter((i) => i.sentiment === sentiment);
    if (minScore) items = items.filter((i) => (i.agentScore as number) >= parseInt(minScore, 10));

    // Sort by timestamp desc
    items.sort((a, b) =>
      (b.timestamp as string).localeCompare(a.timestamp as string)
    );

    const total = items.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = items.slice(start, start + limitNum);

    return response(200, {
      calls: paginated,
      total,
      nextCursor: start + limitNum < total ? String(pageNum + 1) : undefined,
    });
  }

  // GET /analytics
  if (path === "/analytics") {
    // In production: aggregate with DynamoDB queries on GSI2
    // Returning stub for now
    return response(200, {
      message: "Analytics aggregation not yet implemented in Lambda. Use frontend API route.",
    });
  }

  return response(404, { error: "Not found" });
};
