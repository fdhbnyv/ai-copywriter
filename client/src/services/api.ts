import type { GenerateRequest } from '../types';
import { getApiBase } from '../utils/apiBase';

export async function generateCopywritingStream(
  data: GenerateRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const hasImage = !!data.image;
  const base = getApiBase();
  const endpoint = `${base}${hasImage ? '/api/generate-image-text' : '/api/generate-text'}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '请求失败');
    }

    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('text/event-stream')) {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);

            if (dataStr === '[DONE]') {
              onDone();
              return;
            }

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                onChunk(parsed.content);
              }
            } catch {
              continue;
            }
          }
        }
      }
      onDone();
    } else {
      const result = await response.json();
      const text = result.copywriting || result.error || '';
      if (result.error) {
        throw new Error(result.error);
      }
      const chunkSize = 3;
      for (let i = 0; i < text.length; i += chunkSize) {
        await new Promise(r => setTimeout(r, 20));
        onChunk(text.slice(i, i + chunkSize));
      }
      onDone();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败';
    onError(message);
  }
}

export async function generateImage(
  prompt: string,
  size: string = '1024x1024',
  count: number = 1,
  style?: string
): Promise<{ url: string }[]> {
  const response = await fetch(`${getApiBase()}/api/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, size, count, style }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || '图片生成失败');
  }

  const result = await response.json();
  return result.images || [];
}
