"use client";

import { ThemeToggle } from "./ThemeToggle";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs hidden sm:flex">
          Admin
        </Badge>
        <span className="text-sm text-muted-foreground hidden sm:block">Demo User</span>
        <ThemeToggle />
      </div>
    </header>
  );
}
