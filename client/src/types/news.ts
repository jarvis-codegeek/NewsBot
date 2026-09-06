export interface Article {
  id: string;
  title: string;
  originalTitle?: string;
  link: string;
  snippet: string;
  fullSnippet?: string;
  source: string;
  category: string;
  pubDate: string;
  timestamp: number;
  image?: string | null;
  readTime?: string;
}

export type CategoryId = 'all' | 'ai' | 'technology' | 'business' | 'world' | 'science' | 'health' | 'entertainment';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string;
}

export type SummaryMode = 'tldr' | 'deep_dive' | 'eli5' | 'market_impact' | 'timeline';

export interface SummaryModeOption {
  id: SummaryMode;
  label: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: number;
}
