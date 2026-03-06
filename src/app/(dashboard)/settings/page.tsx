"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { DateRangePicker } from "@/components/filters/DateRangePicker";
import { AgentSelect } from "@/components/filters/AgentSelect";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Download, FileText, Shield } from "lucide-react";
import { format } from "date-fns";
import { getExportUrl } from "@/lib/api";
import type { DateRange } from "react-day-picker";

const ROLES = ["Admin", "Manager", "Viewer"] as const;

export default function SettingsPage() {
  const [exportRange, setExportRange] = useState<DateRange | undefined>();
  const [exportAgent, setExportAgent] = useState("all");
  const [currentRole, setCurrentRole] = useState<"Admin" | "Manager" | "Viewer">("Admin");

  const buildExportUrl = (format: "csv" | "pdf") => {
    return getExportUrl(format, {
      agentId: exportAgent !== "all" ? exportAgent : undefined,
      from: exportRange?.from ? format_date(exportRange.from) : undefined,
      to: exportRange?.to ? format_date(exportRange.to) : undefined,
    });
  };

  const format_date = (d: Date) => format(d, "yyyy-MM-dd");

  return (
    <div className="flex flex-col flex-1">
      <Header title="Settings" />
      <main className="flex-1 p-6 space-y-6 max-w-2xl">

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" />
              Export Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Filter export by date range and agent:</p>
              <div className="flex flex-wrap gap-2">
                <DateRangePicker value={exportRange} onChange={setExportRange} />
                <AgentSelect value={exportAgent} onChange={setExportAgent} />
              </div>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-3">
              <a href={buildExportUrl("csv")} download>
                <Button variant="outline" className="gap-2 text-sm">
                  <Download className="h-3 w-3" />
                  Download CSV
                </Button>
              </a>
              <Button
                variant="outline"
                className="gap-2 text-sm"
                onClick={() => alert("PDF export requires server-side rendering. Coming soon.")}
              >
                <FileText className="h-3 w-3" />
                Download PDF
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              CSV includes all call fields. PDF export coming with full server-side rendering.
            </p>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Dark Mode</p>
              <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
            </div>
            <ThemeToggle />
          </CardContent>
        </Card>

        {/* Role Stub */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4" />
              User Role
              <Badge variant="outline" className="text-xs">UI stub — Cognito pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Role-based access control will be enforced via AWS Cognito. Select a role below to preview UI changes.
            </p>
            <div className="flex gap-2">
              {ROLES.map((role) => (
                <Button
                  key={role}
                  variant={currentRole === role ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setCurrentRole(role)}
                >
                  {role}
                </Button>
              ))}
            </div>
            <div className="bg-muted rounded-md p-3 text-xs text-muted-foreground space-y-1">
              <p><strong>Admin:</strong> Full access — manage agents, export, configure settings.</p>
              <p><strong>Manager:</strong> Read + export — no agent management.</p>
              <p><strong>Viewer:</strong> Read only — no export, no settings.</p>
              <p className="mt-2 font-medium text-foreground">Current: {currentRole}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
