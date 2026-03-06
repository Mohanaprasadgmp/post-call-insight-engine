"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  formatDateTime,
  formatDuration,
  sentimentClasses,
  scoreClasses,
  agentColorClasses,
  agentInitials,
  cn,
} from "@/lib/utils";
import type { CallRecord } from "@/lib/types";
import {
  Clock,
  ChevronDown,
  ExternalLink,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
} from "lucide-react";

interface Props {
  calls: CallRecord[];
}

function AccordionRow({ call }: { call: CallRecord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("border rounded-xl bg-card overflow-hidden transition-shadow", open && "shadow-md")}>
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-accent/30 transition-colors"
      >
        {/* Agent avatar */}
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${agentColorClasses(call.agentId)}`}>
          {agentInitials(call.agentName)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{call.agentName}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${sentimentClasses(call.sentiment)}`}>
              {call.sentiment}
            </span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${scoreClasses(call.agentScore)}`}>
              {call.agentScore}/10
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(call.duration)}
            </span>
            <span>{formatDateTime(call.timestamp)}</span>
            <div className="flex gap-1">
              {call.keywords.slice(0, 3).map((kw) => (
                <span key={kw} className="bg-muted text-muted-foreground px-1.5 py-0 rounded text-[10px]">
                  {kw}
                </span>
              ))}
            </div>
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
        <div className="border-t bg-muted/20 px-5 py-4 space-y-4">
          {/* Summary bullets */}
          <div className="space-y-2.5">
            {[
              { icon: MessageSquare, bg: "bg-blue-100 dark:bg-blue-950", color: "text-blue-600 dark:text-blue-400", label: call.summary[0] },
              { icon: CheckCircle, bg: "bg-emerald-100 dark:bg-emerald-950", color: "text-emerald-600 dark:text-emerald-400", label: call.summary[1] },
              { icon: AlertTriangle, bg: "bg-amber-100 dark:bg-amber-950", color: "text-amber-600 dark:text-amber-400", label: call.summary[2] },
            ].map(({ icon: Icon, bg, color, label }, i) => (
              <div key={i} className="flex gap-3">
                <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${bg}`}>
                  <Icon className={`h-3 w-3 ${color}`} />
                </div>
                <span className="text-sm text-foreground/80 leading-snug">{label}</span>
              </div>
            ))}
          </div>

          {/* Improvement tip */}
          <div className="flex gap-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg px-3.5 py-3">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-300">{call.improvement}</p>
          </div>

          {/* All keywords */}
          <div className="flex gap-1.5 flex-wrap">
            {call.keywords.map((kw, i) => {
              const colors = [
                "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
                "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
                "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
                "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
              ];
              return (
                <span key={kw} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[i % colors.length]}`}>
                  {kw}
                </span>
              );
            })}
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
