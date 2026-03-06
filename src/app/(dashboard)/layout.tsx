"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const PAGE_META: { match: string; title: string; subtitle: string }[] = [
  { match: "/analytics",  title: "Analytics",    subtitle: "Monitor your call center performance and trends." },
  { match: "/calls/",     title: "Call Detail",  subtitle: "Full transcript, scoring, and AI insights for this call." },
  { match: "/calls",      title: "Calls",        subtitle: "Browse and review all processed call recordings." },
  { match: "/settings",   title: "Settings",     subtitle: "Manage your preferences and export data." },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();

  const meta = PAGE_META.find((p) => pathname.startsWith(p.match)) ?? { title: "Dashboard", subtitle: "" };

  return (
    <div className="min-h-screen">
      <Header />
      <Sidebar
        expanded={expanded}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      />
      <div
        className="flex flex-col min-h-[calc(100vh-56px)] mt-14 transition-[margin] duration-200 ease-out"
        style={{ marginLeft: expanded ? 240 : 56 }}
      >
        {/* Page title section */}
        <div className="px-6 pt-6 pb-4 border-b border-border/60">
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{meta.title}</h1>
          {meta.subtitle && (
            <p className="text-sm text-muted-foreground mt-1">{meta.subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
