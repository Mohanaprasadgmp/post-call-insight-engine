import { NextRequest, NextResponse } from "next/server";
import { MOCK_CALLS } from "@/lib/mockData";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const call = MOCK_CALLS.find((c) => c.callId === id);
  if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(call);
}
