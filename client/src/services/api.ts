import type { GenerateRequest } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function generateCopywritingStream(
  data: GenerateRequest,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: string) => void
): Promise<void> {
  const hasImage = !!data.image;
  const endpoint = hasImage ? '/api/generate-image-text' : '/api/generate-text';

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
