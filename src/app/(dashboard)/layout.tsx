"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        expanded={expanded}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      />
      <div
        className="flex-1 flex flex-col min-h-screen transition-[margin] duration-200 ease-out"
        style={{ marginLeft: expanded ? 240 : 56 }}
      >
        {children}
      </div>
    </div>
  );
}
