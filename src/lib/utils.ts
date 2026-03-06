import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import type { Sentiment } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy");
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy h:mm a");
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}

// Rich colored badge classes — replaces shadcn variants for sentiment
export function sentimentClasses(sentiment: Sentiment): string {
  return {
    positive: "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    neutral:  "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    negative: "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800",
  }[sentiment];
}

// Rich colored score badge
export function scoreClasses(score: number): string {
  if (score >= 8) return "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800";
  if (score >= 5) return "bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800";
  return "bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800";
}

// Per-agent avatar colors (bg + text)
const AGENT_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400",
];

export function agentColorClasses(agentId: string): string {
  const n = parseInt(agentId.replace(/\D/g, "") || "0", 10);
  return AGENT_COLORS[(n - 1) % AGENT_COLORS.length] ?? AGENT_COLORS[0];
}

export function agentInitials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// Keep these for places that still use shadcn Badge variant prop
export function sentimentBadgeVariant(
  sentiment: Sentiment
): "default" | "secondary" | "destructive" | "outline" {
  return { positive: "default", neutral: "secondary", negative: "destructive" }[sentiment] as never;
}

export function scoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 8) return "default";
  if (score >= 5) return "secondary";
  return "destructive";
}
