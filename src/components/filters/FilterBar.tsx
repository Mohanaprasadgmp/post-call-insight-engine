"use client";

import { DateRangePicker } from "./DateRangePicker";
import { AgentSelect } from "./AgentSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { DateRange } from "react-day-picker";
import type { Sentiment } from "@/lib/types";

export interface FilterState {
  dateRange: DateRange | undefined;
  agentId: string;
  sentiment: string;
  minScore: string;
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  const hasFilters =
    filters.dateRange || filters.agentId !== "all" || filters.sentiment !== "all" || filters.minScore !== "0";

  const reset = () =>
    onChange({ dateRange: undefined, agentId: "all", sentiment: "all", minScore: "0" });

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DateRangePicker
        value={filters.dateRange}
        onChange={(r) => onChange({ ...filters, dateRange: r })}
      />
      <AgentSelect
        value={filters.agentId}
        onChange={(v) => onChange({ ...filters, agentId: v })}
      />
      <Select
        value={filters.sentiment}
        onValueChange={(v) => onChange({ ...filters, sentiment: v })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Sentiment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All sentiment</SelectItem>
          <SelectItem value="positive">Positive</SelectItem>
          <SelectItem value="neutral">Neutral</SelectItem>
          <SelectItem value="negative">Negative</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.minScore}
        onValueChange={(v) => onChange({ ...filters, minScore: v })}
      >
        <SelectTrigger className="w-[130px] h-8 text-xs">
          <SelectValue placeholder="Min score" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="0">Any score</SelectItem>
          <SelectItem value="7">Score 7+</SelectItem>
          <SelectItem value="8">Score 8+</SelectItem>
          <SelectItem value="9">Score 9+</SelectItem>
        </SelectContent>
      </Select>
      {hasFilters && (
        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1" onClick={reset}>
          <X className="h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}
