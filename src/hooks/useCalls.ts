"use client";

import { useState, useEffect, useCallback } from "react";
import type { CallRecord, CallFilters, CallsResponse } from "@/lib/types";
import type { FilterState } from "@/components/filters/FilterBar";
import { format } from "date-fns";

function filterStateToParams(f: FilterState): CallFilters {
  return {
    agentId: f.agentId !== "all" ? f.agentId : undefined,
    from: f.dateRange?.from ? format(f.dateRange.from, "yyyy-MM-dd") : undefined,
    to: f.dateRange?.to ? format(f.dateRange.to, "yyyy-MM-dd") : undefined,
    sentiment: f.sentiment !== "all" ? (f.sentiment as CallFilters["sentiment"]) : undefined,
    minScore: f.minScore !== "0" ? Number(f.minScore) : undefined,
  };
}

export function useCalls(filters: FilterState, page = 1, limit = 10) {
  const [data, setData] = useState<CallsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filterStateToParams(filters);
      const q = new URLSearchParams();
      if (params.agentId) q.set("agentId", params.agentId);
      if (params.from) q.set("from", params.from);
      if (params.to) q.set("to", params.to);
      if (params.sentiment) q.set("sentiment", params.sentiment);
      if (params.minScore) q.set("minScore", String(params.minScore));
      q.set("page", String(page));
      q.set("limit", String(limit));
      const res = await fetch(`/api/calls?${q.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [filters, page, limit]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, refetch: load };
}

export function useCallDetail(id: string) {
  const [call, setCall] = useState<CallRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/calls/${id}`)
      .then((r) => r.json())
      .then(setCall)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { call, loading, error };
}
