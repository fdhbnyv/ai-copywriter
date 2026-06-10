import type { VercelRequest, VercelResponse } from '@vercel/node';

const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY || '';
const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
const MODEL = 'glm-4-flash';

const SYSTEM_PROMPT = `你是一位专业的营销文案撰写专家。请根据用户提供的产品信息和特点，生成吸引人的营销文案。

要求：
1. 文案要简洁有力，突出产品卖点
2. 文案风格要符合用户选择的文案风格
3. 针对指定的目标群体进行精准营销
4. 根据发布平台调整文案格式和风格
5. 包含标题和正文，适当使用 emoji 增加吸引力
6. 最后给出购买建议或行动号召

请直接输出文案内容，不需要额外说明。`;

const TONE_PROMPTS: Record<string, string> = {
  professional: '请以专业商务风格撰写，语气正式、权威，适合企业级产品。',
  friendly: '请以亲切友好风格撰写，语气温暖、真诚，像朋友推荐好物一样。',
  creative: '请以创意潮流风格撰写，语言活泼有创意，适合年轻用户群体。',
  persuasive: '请以说服营销风格撰写，突出性价比和紧迫感，促使用户立即购买。',
  humorous: '请以幽默搞笑风格撰写，语言风趣幽默，让人会心一笑。',
  lyrical: '请以文艺清新风格撰写，语言优美有诗意，适合文艺类产品。',
  luxury: '请以高端奢华风格撰写，突出品质感和尊贵体验。',
  tech: '请以科技极客风格撰写，突出技术参数和创新点。',
};

const PLATFORM_PROMPTS: Record<string, string> = {
  wechat: '请为微信公众号平台优化文案，适合长图文阅读，段落清晰。',
  xiaohongshu: '请为小红书平台优化文案，适合种草分享风格，多用 emoji 和话题标签。',
  douyin: '请为抖音/短视频平台优化文案，语言简洁有力，适合口播或字幕。',
  taobao: '请为淘宝/电商平台优化文案，突出卖点和促销信息，适合商品详情页。',
  weibo: '请为微博平台优化文案，简短有力，适合碎片化阅读。',
  general: '请生成通用营销文案，适用于多种场景。',
};

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
    const { product, features, tone, audience, platform } = req.body;

    if (!product?.trim()) {
      return res.status(400).json({ error: '请输入产品名称' });
    }

    const tonePrompt = TONE_PROMPTS[tone] || `请以"${tone}"风格撰写文案。`;
    const platformPrompt = PLATFORM_PROMPTS[platform] || PLATFORM_PROMPTS.general;

    const userText = `产品信息：
产品名称：${product}
产品特点：${features || ''}
目标群体：${audience || '不限定特定群体'}
发布平台：${platform || '通用'}

${tonePrompt}

${platformPrompt}

请为以下产品生成文案：
产品名称：${product}
产品特点：${features || ''}`;

    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ZHIPU_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userText },
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Zhipu API error: ${response.status}`);
    }

    const result = await response.json();
    const copywriting = result.choices?.[0]?.message?.content || '';
    return res.status(200).json({ copywriting });
  } catch (error) {
    const message = error instanceof Error ? error.message : '生成失败';
    return res.status(500).json({ error: message });
  }
}