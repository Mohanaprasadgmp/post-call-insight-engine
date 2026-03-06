import { NextRequest, NextResponse } from "next/server";
import { getMockAnalytics } from "@/lib/mockData";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  // Proxy to real API Gateway when configured
  if (API_URL) {
    const upstream = new URL(`${API_URL}/analytics`);
    req.nextUrl.searchParams.forEach((v, k) => upstream.searchParams.set(k, v));
    const res = await fetch(upstream.toString());
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  }

  // Mock data fallback
  return NextResponse.json(getMockAnalytics());
}
