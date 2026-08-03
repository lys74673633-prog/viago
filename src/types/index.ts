export type CompetencyType = "academic" | "career" | "community";

export interface SetukInput {
  subject: string;
  keywords: string;
  roleAndReflection: string;
}

export interface SetukVersion {
  type: CompetencyType;
  label: string;
  description: string;
  content: string;
}

export interface SetukGenerateResponse {
  versions: SetukVersion[];
  remaining: number;
  limit: number;
}

export interface UsageStatus {
  used: number;
  limit: number;
  remaining: number;
  dateKey: string;
  isPremium?: boolean;
  authenticated?: boolean;
}

export interface PerformanceTopicInput {
  unit: string;
  keywords: string;
}

export interface RecommendedTopic {
  id: string;
  title: string;
  hook: string;
  angle: string;
}

export interface ApaReference {
  id: string;
  citation: string;
  sourceType: string;
}

export interface PerformanceExpandResult {
  topicTitle: string;
  reportDraft: string;
  speechScript: string;
  references: ApaReference[];
}

export type PerformanceAction = "topics" | "expand";

export interface QuotaResult {
  ok: boolean;
  remaining: number;
  limit: number;
  exhausted?: boolean;
  isPremium?: boolean;
  error?: "QUOTA_EXCEEDED" | "UNAUTHENTICATED" | string;
}
