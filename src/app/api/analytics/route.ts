import { NextResponse } from "next/server";
import { getMockAnalytics } from "@/lib/mockData";

export async function GET() {
  return NextResponse.json(getMockAnalytics());
}
