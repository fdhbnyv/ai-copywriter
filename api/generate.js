// Vercel Serverless Function - 智谱AI文案生成API
// 部署在 /api/generate

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持POST请求' });
  }

  try {
    const { type, data, tone = '专业商务风' } = req.body;

    // 验证必填字段
    if (!type || !data) {
      return res.status(400).json({ error: '缺少必要参数: type 或 data' });
    }

    // 从环境变量获取API Key
    const ZHIPU_API_KEY = process.env.ZHIPU_API_KEY;
    if (!ZHIPU_API_KEY) {
      console.error('ZHIPU_API_KEY 环境变量未设置');
      return res.status(500).json({ error: '服务器配置错误' });
    }

    let result;

    if (type === 'image') {
      // 图片模式：data是base64图片
      result = await callZhipuVisionAPI(data, tone, ZHIPU_API_KEY);
    } else if (type === 'text') {
      // 文字模式：data是产品描述对象
      const { product, features = '' } = data;
      if (!product) {
        return res.status(400).json({ error: '请输入产品名称' });
      }
      result = await callZhipuTextAPI(product, features, tone, ZHIPU_API_KEY);
    } else {
      return res.status(400).json({ error: 'type参数必须是"image"或"text"' });
    }

    // 返回成功结果
    return res.status(200).json({
      success: true,
      ...result,
      tone
    });

  } catch (error) {
    console.error('API调用失败:', error);
    return res.status(500).json({ 
      error: '生成失败', 
      details: error.message 
    });
  }
}

// 调用智谱多模态API（图片识别）
async function callZhipuVisionAPI(imageBase64, tone, apiKey) {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const payload = {
    model: 'glm-4v',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `请分析这张图片，然后：
1. 用一句话描述图片中的产品或场景
2. 根据这个描述，生成一段${tone}的营销文案（200-300字）

要求：
- 描述要准确简洁
- 文案要符合${tone}的风格
- 突出产品卖点
- 语言生动有感染力`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // 尝试读取错误信息
    let errorMsg = `智谱API请求失败: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        // 尝试解析JSON错误
        try {
          const errorJson = JSON.parse(errorData);
          errorMsg = errorJson.error?.message || errorJson.error || errorData.substring(0, 100);
        } catch {
          // 不是JSON，直接使用文本
          errorMsg = errorData.substring(0, 200);
        }
      }
    } catch {
      // 忽略读取错误
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const content = result.choices[0]?.message?.content || '';

  // 解析返回内容（假设格式：描述 + 文案）
  const lines = content.split('\n').filter(line => line.trim());
  const description = lines[0] || '图片内容识别';
  const copywriting = lines.slice(1).join('\n') || content;

  return { description, copywriting };
}

// 调用智谱文本API
async function callZhipuTextAPI(product, features, tone, apiKey) {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  
  const prompt = `产品：${product}
特点：${features}

请生成一段${tone}的营销文案（200-300字），要求：
1. 突出产品核心卖点
2. 语言符合${tone}风格
3. 有吸引力，能激发购买欲
4. 结构清晰，有开头、主体、结尾`;

  const payload = {
    model: 'glm-4-flash',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    // 尝试读取错误信息
    let errorMsg = `智谱API请求失败: ${response.status} ${response.statusText}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        // 尝试解析JSON错误
        try {
          const errorJson = JSON.parse(errorData);
          errorMsg = errorJson.error?.message || errorJson.error || errorData.substring(0, 100);
        } catch {
          // 不是JSON，直接使用文本
          errorMsg = errorData.substring(0, 200);
        }
      }
    } catch {
      // 忽略读取错误
    }
    throw new Error(errorMsg);
  }

  const result = await response.json();
  const copywriting = result.choices[0]?.message?.content || '';

  return { 
    description: `${product}${features ? ` - ${features}` : ''}`,
    copywriting 
  };
}