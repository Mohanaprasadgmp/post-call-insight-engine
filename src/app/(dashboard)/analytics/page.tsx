"use client";

import { useState } from "react";

import { FilterBar, type FilterState } from "@/components/filters/FilterBar";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SentimentTimeline } from "@/components/charts/SentimentTimeline";
import { AgentScoreTrend } from "@/components/charts/AgentScoreTrend";
import { KeywordFrequency } from "@/components/charts/KeywordFrequency";
import { ComplaintCategories } from "@/components/charts/ComplaintCategories";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_FILTERS: FilterState = {
  dateRange: undefined,
  agentId: "all",
  sentiment: "all",
  minScore: "0",
};

export default function AnalyticsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const { data, loading } = useAnalytics();

  return (
    <div className="flex flex-col flex-1">

      <main className="flex-1 p-6 space-y-4">
        <FilterBar filters={filters} onChange={setFilters} />
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-lg" />
            ))}
          </div>
        ) : data ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SentimentTimeline data={data.sentimentByDay} />
            <AgentScoreTrend data={data.scoreByAgent} />
            <KeywordFrequency data={data.topKeywords} />
            <ComplaintCategories data={data.categories} />
          </div>
        ) : null}
      </main>
    </div>
  );
}
