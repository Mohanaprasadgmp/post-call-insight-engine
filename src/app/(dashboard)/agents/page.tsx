"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useCalls } from "@/hooks/useCalls";
import { AgentScoreTrend } from "@/components/charts/AgentScoreTrend";
import { CallCard } from "@/components/calls/CallCard";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { scoreBadgeVariant } from "@/lib/utils";
import type { FilterState } from "@/components/filters/FilterBar";

const DEFAULT_FILTERS: FilterState = {
  dateRange: undefined,
  agentId: "all",
  sentiment: "all",
  minScore: "0",
};

export default function AgentsPage() {
  const { data: analytics, loading } = useAnalytics();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const agentFilter: FilterState = {
    ...DEFAULT_FILTERS,
    agentId: selectedAgent ?? "all",
  };
  const { data: callsData } = useCalls(agentFilter, 1, 5);

  const sorted = analytics?.scoreByAgent
    ? [...analytics.scoreByAgent].sort((a, b) => b.avgScore - a.avgScore)
    : [];

  return (
    <div className="flex flex-col flex-1">
      <Header title="Agents" />
      <main className="flex-1 p-6 space-y-6">
        {loading ? (
          <Skeleton className="h-72 w-full rounded-lg" />
        ) : (
          <>
            {/* Leaderboard */}
            <div className="rounded-lg border bg-card">
              <div className="px-4 py-3 border-b">
                <h2 className="text-sm font-medium">Agent Leaderboard</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">Rank</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead className="text-right">Avg Score</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Avg Sentiment</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((agent, i) => (
                    <TableRow
                      key={agent.agentId}
                      className={selectedAgent === agent.agentId ? "bg-accent" : ""}
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        #{i + 1}
                      </TableCell>
                      <TableCell className="font-medium">{agent.agentName}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={scoreBadgeVariant(Math.round(agent.avgScore))}>
                          {agent.avgScore.toFixed(1)}/10
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {agent.callCount}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {agent.avgSentiment}/100
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            setSelectedAgent(
                              selectedAgent === agent.agentId ? null : agent.agentId
                            )
                          }
                        >
                          {selectedAgent === agent.agentId ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {analytics && <AgentScoreTrend data={analytics.scoreByAgent} />}

            {selectedAgent && callsData && (
              <div>
                <h2 className="text-sm font-medium mb-3">
                  Recent calls for{" "}
                  {sorted.find((a) => a.agentId === selectedAgent)?.agentName}
                </h2>
                <div className="space-y-2">
                  {callsData.calls.map((call) => (
                    <CallCard key={call.callId} call={call} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
