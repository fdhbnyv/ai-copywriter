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
    if (!MANXIAOBAI_API_KEY) {
      return res.status(500).json({ error: 'MANXIAOBAI_API_KEY 未配置' });
    }

    const { prompt, size, count, style, refImages } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: '请输入提示词' });
    }

    const styleMap: Record<string, string> = {
      realistic: '写实摄影风格，真实光影和质感',
      anime: '日本动漫风格，线条清晰，色彩鲜艳',
      pixel: '像素艺术风格，像素块清晰可见',
      '3d': '3D渲染风格，立体感强，材质真实',
      watercolor: '水彩画风格，柔和的色彩过渡',
      sketch: '铅笔线稿风格，黑白素描质感',
    };

    const styleSuffix = style && styleMap[style] ? ` (${styleMap[style]})` : '';

    const body: Record<string, unknown> = {
      model: 'gpt-image-2',
      prompt: prompt + styleSuffix,
      n: Math.min(count || 1, 4),
      size: size || '1024x1024',
    };

    const response = await fetch(MANXIAOBAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANXIAOBAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
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
