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

export function sentimentColor(sentiment: Sentiment): string {
  return {
    positive: "text-green-600 dark:text-green-400",
    neutral: "text-yellow-600 dark:text-yellow-400",
    negative: "text-red-600 dark:text-red-400",
  }[sentiment];
}

export function sentimentBadgeVariant(
  sentiment: Sentiment
): "default" | "secondary" | "destructive" | "outline" {
  return {
    positive: "default",
    neutral: "secondary",
    negative: "destructive",
  }[sentiment] as "default" | "secondary" | "destructive";
}

export function scoreBadgeVariant(
  score: number
): "default" | "secondary" | "destructive" | "outline" {
  if (score >= 8) return "default";
  if (score >= 5) return "secondary";
  return "destructive";
}
