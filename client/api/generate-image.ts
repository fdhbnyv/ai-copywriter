import type { VercelRequest, VercelResponse } from '@vercel/node';

const MANXIAOBAI_API_KEY = process.env.MANXIAOBAI_API_KEY || '';
const MANXIAOBAI_API_URL = 'https://api.manxiaobai.online/v1/images/generations';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, size, count } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: '请输入提示词' });
    }

    const response = await fetch(MANXIAOBAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANXIAOBAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-2',
        prompt,
        n: Math.min(count || 1, 4),
        size: size || '1024x1024',
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = err.error?.message || response.statusText;
      return res.status(500).json({ error: `图片生成失败: ${message}` });
    }

    const result = await response.json();
    return res.status(200).json({ images: result.data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '图片生成失败';
    return res.status(500).json({ error: message });
  }
}
