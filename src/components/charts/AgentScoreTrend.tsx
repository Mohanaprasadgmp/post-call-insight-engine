"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoreByAgent } from "@/lib/types";

interface Props {
  data: ScoreByAgent[];
}

// Distinct palette matching agent avatar colors
const AGENT_COLORS = ["#6366f1", "#3b82f6", "#10b981", "#8b5cf6", "#f43f5e"];

export function AgentScoreTrend({ data }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Agent Performance</CardTitle>
          <div className="flex gap-3">
            {data.slice(0, 3).map((a, i) => (
              <span key={a.agentId} className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full inline-block" style={{ backgroundColor: AGENT_COLORS[i] }} />
                {a.agentName.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 10]}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="agentName"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
              formatter={(value: number) => [`${value.toFixed(1)} / 10`, "Avg Score"]}
            />
            <Bar dataKey="avgScore" radius={[0, 6, 6, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={AGENT_COLORS[i % AGENT_COLORS.length]} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
