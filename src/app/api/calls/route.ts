import { NextRequest, NextResponse } from "next/server";
import { MOCK_CALLS } from "@/lib/mockData";
import type { Sentiment } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  // Proxy to real API Gateway when configured
  if (API_URL) {
    const upstream = new URL(`${API_URL}/calls`);
    req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
    const res = await fetch(upstream.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  // Mock data fallback
  const { searchParams } = req.nextUrl;
  const agentId = searchParams.get("agentId") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const sentiment = searchParams.get("sentiment") as Sentiment | null;
  const minScore = searchParams.get("minScore") ? Number(searchParams.get("minScore")) : undefined;
  const maxScore = searchParams.get("maxScore") ? Number(searchParams.get("maxScore")) : undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "10");

  let calls = [...MOCK_CALLS];

  if (agentId) calls = calls.filter((c) => c.agentId === agentId);
  if (from) calls = calls.filter((c) => c.timestamp >= from);
  if (to) calls = calls.filter((c) => c.timestamp <= to + "T23:59:59Z");
  if (sentiment) calls = calls.filter((c) => c.sentiment === sentiment);
  if (minScore !== undefined) calls = calls.filter((c) => c.agentScore >= minScore);
  if (maxScore !== undefined) calls = calls.filter((c) => c.agentScore <= maxScore);

  const total = calls.length;
  const start = (page - 1) * limit;
  const paginated = calls.slice(start, start + limit);

  return NextResponse.json({
    calls: paginated,
    total,
    nextCursor: start + limit < total ? String(page + 1) : undefined,
  });
}
