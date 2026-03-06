"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MOCK_AGENTS } from "@/lib/mockData";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export function AgentSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue placeholder="All agents" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All agents</SelectItem>
        {MOCK_AGENTS.map((a) => (
          <SelectItem key={a.agentId} value={a.agentId}>
            {a.agentName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
