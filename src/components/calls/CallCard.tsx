import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatDateTime,
  formatDuration,
  sentimentBadgeVariant,
  scoreBadgeVariant,
} from "@/lib/utils";
import type { CallRecord } from "@/lib/types";
import { Clock, User, ChevronRight } from "lucide-react";

interface Props {
  call: CallRecord;
}

export function CallCard({ call }: Props) {
  return (
    <Link href={`/calls/${call.callId}`}>
      <Card className="hover:bg-accent/50 transition-colors cursor-pointer group">
        <CardContent className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Row 1: name + badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{call.agentName}</span>
                <Badge variant={sentimentBadgeVariant(call.sentiment)} className="text-xs">
                  {call.sentiment}
                </Badge>
                <Badge variant={scoreBadgeVariant(call.agentScore)} className="text-xs">
                  Score: {call.agentScore}/10
                </Badge>
              </div>
              {/* Row 2: meta */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
              {/* Row 3: summary */}
              <ul className="space-y-1">
                {call.summary.map((line, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="shrink-0 mt-0.5">{i === 2 ? "⚑" : "•"}</span>
                    <span className="line-clamp-1">{line}</span>
                  </li>
                ))}
              </ul>
              {/* Row 4: keywords */}
              <div className="flex gap-1.5 flex-wrap">
                {call.keywords.slice(0, 4).map((kw) => (
                  <Badge key={kw} variant="outline" className="text-xs px-2 py-0">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
