"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatDuration,
  sentimentBadgeVariant,
  scoreBadgeVariant,
} from "@/lib/utils";
import type { CallRecord } from "@/lib/types";
import {
  Clock,
  User,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  calls: CallRecord[];
}

function AccordionRow({ call }: { call: CallRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("border rounded-lg bg-card overflow-hidden transition-shadow", open && "shadow-sm")}>
      {/* Header — always visible, click to expand */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-accent/40 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{call.agentName}</span>
            <Badge variant={sentimentBadgeVariant(call.sentiment)} className="text-xs">
              {call.sentiment}
            </Badge>
            <Badge variant={scoreBadgeVariant(call.agentScore)} className="text-xs">
              {call.agentScore}/10
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {call.agentId}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration)}
            </span>
            <span>{formatDateTime(call.timestamp)}</span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Expanded body */}
      {open && (
        <div className="border-t px-5 py-4 space-y-4">
          {/* Summary */}
          <div className="space-y-2">
            {[
              { icon: MessageSquare, color: "text-blue-500", label: call.summary[0] },
              { icon: CheckCircle, color: "text-green-500", label: call.summary[1] },
              { icon: AlertTriangle, color: "text-amber-500", label: call.summary[2] },
            ].map(({ icon: Icon, color, label }, i) => (
              <div key={i} className="flex gap-2.5 text-sm">
                <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", color)} />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>

          {/* Improvement tip */}
          <div className="flex gap-2.5 bg-muted/50 rounded-md px-3 py-2.5">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{call.improvement}</p>
          </div>

          {/* Keywords */}
          <div className="flex gap-1.5 flex-wrap">
            {call.keywords.map((kw) => (
              <Badge key={kw} variant="outline" className="text-xs px-2">
                {kw}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-1">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-xs h-7">
              <Link href={`/calls/${call.callId}`}>
                <ExternalLink className="h-3 w-3" />
                Full details
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CallAccordion({ calls }: Props) {
  return (
    <div className="space-y-3">
      {calls.map((call) => (
        <AccordionRow key={call.callId} call={call} />
      ))}
    </div>
  );
}
