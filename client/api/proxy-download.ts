import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { url } = req.query;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url param' });
  }

  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="ai-${Date.now()}.png"`);
    return res.status(200).send(Buffer.from(buffer));
  } catch {
    return res.status(500).json({ error: 'Download failed' });
  }
}
