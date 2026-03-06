"use client";

import { useAnalytics } from "@/hooks/useAnalytics";
import { useCalls } from "@/hooks/useCalls";
import { KpiCard } from "@/components/kpis/KpiCard";
import { SentimentTimeline } from "@/components/charts/SentimentTimeline";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, TrendingUp, Star, AlertTriangle, ChevronRight } from "lucide-react";
import { MOCK_CALLS } from "@/lib/mockData";
import {
  formatRelative,
  formatDuration,
  sentimentBadgeVariant,
  scoreBadgeVariant,
} from "@/lib/utils";
import Link from "next/link";
import type { CallRecord } from "@/lib/types";

const DEFAULT_FILTERS = {
  dateRange: undefined,
  agentId: "all",
  sentiment: "all",
  minScore: "0",
};

function RecentCallRow({ call }: { call: CallRecord }) {
  return (
    <Link href={`/calls/${call.callId}`}>
      <div className="flex items-center gap-3 py-2.5 px-1 rounded-md hover:bg-accent/50 transition-colors group cursor-pointer">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{call.agentName}</span>
            <Badge variant={sentimentBadgeVariant(call.sentiment)} className="text-xs shrink-0">
              {call.sentiment}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {formatDuration(call.duration)} · {formatRelative(call.timestamp)}
          </p>
        </div>
        <Badge variant={scoreBadgeVariant(call.agentScore)} className="text-xs shrink-0">
          {call.agentScore}/10
        </Badge>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 group-hover:text-muted-foreground transition-colors" />
      </div>
    </Link>
  );
}

export default function OverviewPage() {
  const { data: analytics, loading: analyticsLoading } = useAnalytics();
  const { data: callsData } = useCalls(DEFAULT_FILTERS, 1, 5);

  const todayCalls = MOCK_CALLS.filter((c) => c.timestamp.startsWith("2026-03-06")).length;
  const avgSentiment = analytics
    ? Math.round(
        analytics.sentimentByDay.reduce((s, d) => s + d.sentimentScore, 0) /
          analytics.sentimentByDay.length
      )
    : 0;
  const avgScore = analytics
    ? (
        analytics.scoreByAgent.reduce((s, a) => s + a.avgScore, 0) /
        analytics.scoreByAgent.length
      ).toFixed(1)
    : "0";
  const flaggedCalls = MOCK_CALLS.filter((c) => c.agentScore <= 5).length;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Overview" />
      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            title="Calls Today"
            value={todayCalls}
            icon={Phone}
            subtitle="calls processed"
          />
          <KpiCard
            title="Avg Sentiment"
            value={analyticsLoading ? "..." : `${avgSentiment}/100`}
            icon={TrendingUp}
            trend="up"
            trendValue="+3"
            subtitle="vs last week"
          />
          <KpiCard
            title="Avg Agent Score"
            value={analyticsLoading ? "..." : `${avgScore}/10`}
            icon={Star}
            trend="up"
            trendValue="+0.4"
            subtitle="vs last week"
          />
          <KpiCard
            title="Flagged Calls"
            value={flaggedCalls}
            icon={AlertTriangle}
            trend="down"
            trendValue="-2"
            subtitle="vs yesterday"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2">
            {analytics && <SentimentTimeline data={analytics.sentimentByDay} compact />}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium">Recent Calls</CardTitle>
              <Link href="/calls" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <div className="divide-y divide-border/60">
                {callsData?.calls.slice(0, 5).map((call) => (
                  <RecentCallRow key={call.callId} call={call} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
