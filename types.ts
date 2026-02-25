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

export type ModelType = 'gemini-2.5-flash' | 'gemini-2.5-pro' | 'gemini-3-pro-preview';

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