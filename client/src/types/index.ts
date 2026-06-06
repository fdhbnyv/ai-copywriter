export type ToneStyle = string;

export type Platform = 'wechat' | 'xiaohongshu' | 'douyin' | 'taobao' | 'weibo' | 'general' | string;

export interface GenerateRequest {
  product: string;
  features: string;
  tone: string;
  audience?: string;
  platform?: Platform;
  image?: string;
}

export interface GenerateResponse {
  copywriting: string;
}

export interface GenerateError {
  error: string;
}

export type StatusType = 'success' | 'error' | null;
