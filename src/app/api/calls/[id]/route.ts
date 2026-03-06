import { NextRequest, NextResponse } from "next/server";
import { MOCK_CALLS } from "@/lib/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Proxy to real API Gateway when configured
  if (API_URL) {
    const res = await fetch(`${API_URL}/calls/${id}`);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  // Mock data fallback
  const call = MOCK_CALLS.find((c) => c.callId === id);
  if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(call);
}
