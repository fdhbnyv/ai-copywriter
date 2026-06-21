import type { VercelRequest, VercelResponse } from '@vercel/node';

const MANXIAOBAI_API_KEY = process.env.MANXIAOBAI_API_KEY || '';
const MANXIAOBAI_API_URL = 'https://api.manxiaobai.online/v1/images/generations';

const AGNES_API_KEY = process.env.AGNES_API_KEY || 'sk-EefVkRE4ZY9nFNeN1qYEvaLRQFuBhgr32S6AJMeTDgmAlfmD';
const AGNES_API_URL = 'https://apihub.agnes-ai.com/v1/images/generations';
const AGNES_MODEL = 'agnes-image-2.1-flash';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { prompt, size, count, style, model: modelChoice = 'premium' } = req.body;

    if (!prompt?.trim()) {
      return res.status(400).json({ error: '请输入提示词' });
    }

    // --- Free model (Agnes) ---
    if (modelChoice === 'free') {
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
        model: AGNES_MODEL,
        prompt: prompt.trim() + styleSuffix,
        n: Math.min(count || 1, 4),
        size: size || '1024x1024',
      };

      const response = await fetch(AGNES_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${AGNES_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(120000),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '{}');
        return res.status(500).json({
          error: `免费模型生成失败: ${errText.substring(0, 200)}`,
          model: 'free',
        });
      }

      const result = await response.json();
      // The images might be in result.data or result.images depending on API format
      const images = result.data || result.images || [];
      return res.status(200).json({ images, model: 'free' });
    }

    // --- Premium model (Manxiaobai / GPT-Image-2) ---
    if (!MANXIAOBAI_API_KEY) {
      return res.status(500).json({ error: 'MANXIAOBAI_API_KEY 未配置' });
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
      signal: AbortSignal.timeout(120000),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const message = err.error?.message || response.statusText;
      return res.status(500).json({ error: `高级模型生成失败: ${message}`, model: 'premium' });
    }

    const result = await response.json();
    return res.status(200).json({ images: result.data || [], model: 'premium' });
  } catch (error) {
    const message = error instanceof Error ? error.message : '图片生成失败';
    if (message.includes('timeout') || message.includes('Timeout') || message.includes('timed out') || message.includes('aborted') || message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      return res.status(504).json({ error: `请求失败(超时): 请检查网络或稍后重试`, detail: message });
    }
    return res.status(500).json({ error: `图片生成失败: ${message}` });
  }
}
