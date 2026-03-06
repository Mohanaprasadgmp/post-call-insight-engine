import { NextRequest, NextResponse } from "next/server";
import { MOCK_CALLS } from "@/lib/mockData";
import Papa from "papaparse";
import type { CallRecord, Sentiment } from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const format = searchParams.get("format") ?? "csv";
  const agentId = searchParams.get("agentId") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const sentiment = searchParams.get("sentiment") as Sentiment | null;

  let calls: CallRecord[];

  if (API_URL) {
    // Fetch from real API when configured
    const upstream = new URL(`${API_URL}/calls`);
    if (agentId) upstream.searchParams.set("agentId", agentId);
    if (from) upstream.searchParams.set("from", from);
    if (to) upstream.searchParams.set("to", to);
    if (sentiment) upstream.searchParams.set("sentiment", sentiment);
    upstream.searchParams.set("limit", "1000");
    const res = await fetch(upstream.toString());
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const data = await res.json();
    calls = data.calls as CallRecord[];
  } else {
    // Mock data fallback
    calls = [...MOCK_CALLS];
    if (agentId) calls = calls.filter((c) => c.agentId === agentId);
    if (from) calls = calls.filter((c) => c.timestamp >= from);
    if (to) calls = calls.filter((c) => c.timestamp <= to + "T23:59:59Z");
    if (sentiment) calls = calls.filter((c) => c.sentiment === sentiment);
  }

  if (format === "csv") {
    const rows = calls.map((c) => ({
      "Call ID": c.callId,
      "Timestamp": c.timestamp,
      "Agent": c.agentName,
      "Duration (s)": c.duration,
      "Score": c.agentScore,
      "Sentiment": c.sentiment,
      "Sentiment Score": c.sentimentScore,
      "Issue": c.summary[0],
      "Outcome": c.summary[1],
      "Flag": c.summary[2],
      "Improvement": c.improvement,
      "Keywords": c.keywords.join(", "),
      "Tags": c.tags.join(", "),
    }));
    const csv = Papa.unparse(rows);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="call-insights-${Date.now()}.csv"`,
      },
    });
  }

  // PDF: return JSON with a message — PDF rendering done client-side in Settings
  return NextResponse.json(
    { message: "PDF export use the client-side renderer.", calls },
    { status: 200 }
  );
}
