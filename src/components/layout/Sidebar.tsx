"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Phone,
  BarChart3,
  Users,
  Settings,
  Headphones,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/calls", label: "Calls", icon: Phone },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface Props {
  expanded: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Sidebar({ expanded, onMouseEnter, onMouseLeave }: Props) {
  const pathname = usePathname();

  return (
    <aside
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "hidden md:flex flex-col h-screen fixed top-0 left-0 z-40 overflow-hidden",
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "transition-[width] duration-200 ease-out shadow-sm",
        expanded ? "w-60 shadow-lg" : "w-14"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 shrink-0 border-b border-sidebar-border px-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Headphones className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span
            className={cn(
              "font-semibold text-sm text-sidebar-foreground whitespace-nowrap transition-opacity duration-150",
              expanded ? "opacity-100" : "opacity-0"
            )}
          >
            Post-Call Insights
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "transition-opacity duration-150",
                  expanded ? "opacity-100" : "opacity-0"
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Version */}
      <div className="px-3.5 py-3 border-t border-sidebar-border">
        <span
          className={cn(
            "text-xs text-sidebar-foreground/40 whitespace-nowrap transition-opacity duration-150",
            expanded ? "opacity-100" : "opacity-0"
          )}
        >
          v0.1.0 — Mock Data
        </span>
      </div>
    </aside>
  );
}
