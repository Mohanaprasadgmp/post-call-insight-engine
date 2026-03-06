export type Sentiment = "positive" | "neutral" | "negative";

export interface CallRecord {
  callId: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  duration: number; // seconds
  summary: [string, string, string]; // [issue, outcome, flag]
  agentScore: number; // 1-10
  improvement: string;
  keywords: string[];
  sentimentScore: number; // 0-100
  sentiment: Sentiment;
  audioS3Key?: string;
  transcriptS3Key?: string;
  transcriptText?: string;
  tags: string[];
  processedAt: string;
}

export interface CallsResponse {
  calls: CallRecord[];
  total: number;
  nextCursor?: string;
}

export interface CallFilters {
  agentId?: string;
  from?: string;
  to?: string;
  sentiment?: Sentiment;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}

export interface SentimentByDay {
  date: string;
  sentimentScore: number;
  callCount: number;
}

export interface ScoreByAgent {
  agentId: string;
  agentName: string;
  avgScore: number;
  callCount: number;
  avgSentiment: number;
}

export interface KeywordFrequency {
  keyword: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface AnalyticsResponse {
  sentimentByDay: SentimentByDay[];
  scoreByAgent: ScoreByAgent[];
  topKeywords: KeywordFrequency[];
  categories: CategoryBreakdown[];
}

export type UserRole = "admin" | "manager" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
