"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Headphones, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 border-b bg-card z-30 flex items-center justify-between pl-3 pr-6">
      {/* Logo + name */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary shadow-sm">
          <Headphones className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-bold text-sm text-foreground">Post-Call Insights</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold text-foreground leading-tight">Demo User</span>
          <span className="text-[10px] text-muted-foreground leading-tight">Administrator</span>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-950 text-xs font-bold text-violet-700 dark:text-violet-400 select-none">
          DU
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-rose-500" title="Logout">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
