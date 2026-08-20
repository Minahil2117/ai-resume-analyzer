export type SectionRating = "strong" | "needs-work" | "missing";

export interface SectionFeedback {
  section: string;
  rating: SectionRating;
  feedback: string;
}

export interface AnalysisResult {
  overallScore: number; // 0-100
  summary: string;
  matchedKeywords: string[];
  missingKeywords: string[];
  sectionFeedback: SectionFeedback[];
  topSuggestions: string[];
}

export interface AnalyzeErrorResponse {
  error: string;
}
