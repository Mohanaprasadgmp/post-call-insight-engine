"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-14 h-7 rounded-full bg-muted" />;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative inline-flex h-7 w-14 shrink-0 items-center rounded-full transition-colors duration-200 focus-visible:outline-none",
        isDark ? "bg-primary" : "bg-muted"
      )}
      aria-label="Toggle theme"
    >
      {/* Icons */}
      <Sun className="absolute left-1.5 h-3.5 w-3.5 text-amber-400" />
      <Moon className="absolute right-1.5 h-3.5 w-3.5 text-slate-300" />
      {/* Thumb */}
      <span
        className={cn(
          "absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
          isDark ? "translate-x-7" : "translate-x-1"
        )}
      />
    </button>
  );
}
