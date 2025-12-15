export interface TranslationRequest {
  text: string;
}

export interface TranslationResponse {
  translatedText: string;
  error?: string;
}

export enum ViewMode {
  Split = 'SPLIT',
  Focus = 'FOCUS',
}

export type TranslationStyle = 'default' | 'fantasy' | 'slice_of_life' | 'action' | 'mystery';

export interface Relationship {
  id: string;
  source: string;
  relation: string;
  target: string;
}

export interface GlossaryTerm {
  id: string;
  source: string;
  target: string;
}