import type { VercelRequest, VercelResponse } from '@vercel/node';

const MANXIAOBAI_API_KEY = process.env.MANXIAOBAI_API_KEY || '';
const MANXIAOBAI_API_URL = 'https://api.manxiaobai.online/v1/images/edits';

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

    if (!refImages?.length) {
      return res.status(400).json({ error: '请上传参考图片' });
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

    const formData = new FormData();
    formData.append('model', 'gpt-image-2');
    formData.append('prompt', prompt + styleSuffix);
    formData.append('size', size || '1024x1024');
    formData.append('n', String(Math.min(count || 1, 4)));

    refImages.slice(0, 16).forEach((img: string) => {
      const base64Data = img.split(',')[1] || img;
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: 'image/png' });
      formData.append('image', blob, 'ref.png');
    });

    const apiRes = await fetch(MANXIAOBAI_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${MANXIAOBAI_API_KEY}`,
      },
      body: formData,
      signal: AbortSignal.timeout(20000),
    });

    if (!apiRes.ok) {
      const err = await apiRes.text().catch(() => '{}');
      return res.status(500).json({ error: `编辑失败: ${err.substring(0, 200)}` });
    }

    const result = await apiRes.json();
    return res.status(200).json({ images: result.data || [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : '编辑失败';
    return res.status(500).json({ error: message });
  }
}