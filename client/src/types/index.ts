export type ToneStyle = 'professional' | 'friendly' | 'creative' | 'persuasive';

export interface GenerateRequest {
  product: string;
  features: string;
  tone: ToneStyle;
  image?: string;
}

export interface GenerateResponse {
  copywriting: string;
}

export interface GenerateError {
  error: string;
}

export type StatusType = 'success' | 'error' | null;
