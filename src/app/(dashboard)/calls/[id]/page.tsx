"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallDetail } from "@/hooks/useCalls";
import { Header } from "@/components/layout/Header";
import { SummaryBullets } from "@/components/calls/SummaryBullets";
import { AudioPlayer } from "@/components/calls/AudioPlayer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatDateTime,
  formatDuration,
  sentimentBadgeVariant,
  scoreBadgeVariant,
} from "@/lib/utils";
import { ArrowLeft, Clock, User, Lightbulb } from "lucide-react";

export default function CallDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { call, loading, error } = useCallDetail(id);

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Call Detail" />
        <main className="flex-1 p-6 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </main>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Call Detail" />
        <main className="flex-1 p-6">
          <p className="text-destructive text-sm">Call not found.</p>
          <Button variant="link" onClick={() => router.back()} className="mt-2 pl-0 text-xs">
            Go back
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1">
      <Header title="Call Detail" />
      <main className="flex-1 p-6 space-y-4 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs mb-2 -ml-1"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-3 w-3" />
          Back to calls
        </Button>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={sentimentBadgeVariant(call.sentiment)}>{call.sentiment}</Badge>
          <Badge variant={scoreBadgeVariant(call.agentScore)}>
            Score: {call.agentScore}/10
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            {call.agentName}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatDuration(call.duration)}
          </span>
          <span className="text-xs text-muted-foreground">{formatDateTime(call.timestamp)}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryBullets summary={call.summary} />

          {/* Score + Improvement */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Agent Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(call.agentScore / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {call.agentScore}/10
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sentiment Score</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${call.sentimentScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {call.sentimentScore}/100
                  </span>
                </div>
              </div>
              <div className="bg-muted/50 rounded-md p-3 flex gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium mb-0.5">Improvement Tip</p>
                  <p className="text-xs text-muted-foreground">{call.improvement}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <AudioPlayer audioS3Key={call.audioS3Key} callId={call.callId} />

        {/* Keywords */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Keywords</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {call.keywords.map((kw) => (
              <Badge key={kw} variant="secondary" className="text-xs">
                {kw}
              </Badge>
            ))}
            {call.tags.map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </CardContent>
        </Card>

        {/* Transcript */}
        {call.transcriptText && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
                {call.transcriptText}
              </pre>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
