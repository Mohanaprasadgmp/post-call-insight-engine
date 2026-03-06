import type { CallsResponse, CallRecord, AnalyticsResponse, CallFilters } from "./types";

const BASE = "/api";

function buildQuery(params: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function fetchCalls(filters: CallFilters = {}): Promise<CallsResponse> {
  const res = await fetch(`${BASE}/calls${buildQuery(filters as Record<string, string | number | undefined>)}`);
  if (!res.ok) throw new Error("Failed to fetch calls");
  return res.json();
}

export async function fetchCall(id: string): Promise<CallRecord> {
  const res = await fetch(`${BASE}/calls/${id}`);
  if (!res.ok) throw new Error("Failed to fetch call");
  return res.json();
}

export async function fetchAnalytics(
  from?: string,
  to?: string,
  agentId?: string,
  groupBy?: "day" | "week" | "month"
): Promise<AnalyticsResponse> {
  const res = await fetch(`${BASE}/analytics${buildQuery({ from, to, agentId, groupBy })}`);
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function getExportUrl(
  format: "csv" | "pdf",
  filters: Omit<CallFilters, "page" | "limit"> = {}
): string {
  return `${BASE}/export${buildQuery({ ...filters as Record<string, string | number | undefined>, format })}`;
}
