import type { GenerateRequest, GenerateResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as any).error || '请求失败');
  }

  return data;
}

export async function generateCopywriting(data: GenerateRequest): Promise<GenerateResponse> {
  const hasImage = !!data.image;
  const endpoint = hasImage ? '/api/generate-image-text' : '/api/generate-text';
  
  return request<GenerateResponse>(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
