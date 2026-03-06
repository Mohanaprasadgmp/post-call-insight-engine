"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Phone, BarChart3, Settings } from "lucide-react";

const navItems = [
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    activeColor: "text-indigo-500",
    activeBg: "bg-indigo-50 dark:bg-indigo-950/60",
  },
  {
    href: "/calls",
    label: "Calls",
    icon: Phone,
    activeColor: "text-blue-500",
    activeBg: "bg-blue-50 dark:bg-blue-950/60",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    activeColor: "text-slate-500",
    activeBg: "bg-slate-100 dark:bg-slate-800/60",
  },
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
        "hidden md:flex flex-col fixed top-14 left-0 bottom-0 z-40 overflow-hidden",
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "transition-[width] duration-200 ease-out",
        expanded ? "w-60 shadow-xl" : "w-14 shadow-sm"
      )}
    >
      <nav className="flex-1 py-2 px-2 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, activeColor, activeBg }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={!expanded ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-sm font-medium transition-all whitespace-nowrap",
                active
                  ? cn(activeBg, activeColor)
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? activeColor : "")} />
              <span className={cn("transition-opacity duration-150", expanded ? "opacity-100" : "opacity-0")}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3.5 py-3 border-t border-sidebar-border">
        <span className={cn("text-xs text-sidebar-foreground/30 whitespace-nowrap transition-opacity duration-150", expanded ? "opacity-100" : "opacity-0")}>
          v0.1.0
        </span>
      </div>
    </aside>
  );
}
