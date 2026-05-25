// Vercel Serverless Function - 智谱AI文案生成API（流式响应版）
// 部署在 /api/generate

module.exports = async function handler(req, res) {
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

    // 设置流式响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    if (type === 'image') {
      // 图片模式：data是base64图片
      await streamZhipuVisionAPI(data, tone, ZHIPU_API_KEY, res);
    } else if (type === 'text') {
      // 文字模式：data是产品描述对象
      const { product, features = '' } = data;
      if (!product) {
        res.write(`data: ${JSON.stringify({ error: '请输入产品名称' })}\n\n`);
        res.end();
        return;
      }
      await streamZhipuTextAPI(product, features, tone, ZHIPU_API_KEY, res);
    } else {
      res.write(`data: ${JSON.stringify({ error: 'type参数必须是"image"或"text"' })}\n\n`);
      res.end();
    }

  } catch (error) {
    console.error('API调用失败:', error);
    res.write(`data: ${JSON.stringify({ 
      success: false,
      error: '生成失败', 
      details: error.message 
    })}\n\n`);
    res.end();
  }
}

// 流式调用智谱多模态API（图片识别）
async function streamZhipuVisionAPI(imageBase64, tone, apiKey, res) {
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
    max_tokens: 1000,
    stream: true  // 启用流式响应
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
    let errorMsg = `智谱API请求失败: ${response.status}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        try {
          const errorJson = JSON.parse(errorData);
          errorMsg = errorJson.error?.message || errorJson.error || errorData.substring(0, 100);
        } catch {
          errorMsg = errorData.substring(0, 200);
        }
      }
    } catch {}
    res.write(`data: ${JSON.stringify({ success: false, error: errorMsg })}\n\n`);
    res.end();
    return;
  }

  // 流式转发智谱API的响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              // 实时转发给前端
              res.write(`data: ${JSON.stringify({ 
                success: true, 
                chunk: delta,
                done: false 
              })}\n\n`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 解析最终内容
    const lines = fullContent.split('\n').filter(line => line.trim());
    const description = lines[0] || '图片内容识别';
    const copywriting = lines.slice(1).join('\n') || fullContent;

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      success: true,
      description,
      copywriting,
      tone,
      done: true
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error('流式处理失败:', error);
    res.write(`data: ${JSON.stringify({ 
      success: false,
      error: '流式处理失败', 
      details: error.message 
    })}\n\n`);
    res.end();
  }
}

// 流式调用智谱文本API
async function streamZhipuTextAPI(product, features, tone, apiKey, res) {
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
    max_tokens: 800,
    stream: true  // 启用流式响应
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
    let errorMsg = `智谱API请求失败: ${response.status}`;
    try {
      const errorData = await response.text();
      if (errorData) {
        try {
          const errorJson = JSON.parse(errorData);
          errorMsg = errorJson.error?.message || errorJson.error || errorData.substring(0, 100);
        } catch {
          errorMsg = errorData.substring(0, 200);
        }
      }
    } catch {}
    res.write(`data: ${JSON.stringify({ success: false, error: errorMsg })}\n\n`);
    res.end();
    return;
  }

  // 流式转发智谱API的响应
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6);
          if (dataStr === '[DONE]') continue;
          
          try {
            const data = JSON.parse(dataStr);
            const delta = data.choices[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              // 实时转发给前端
              res.write(`data: ${JSON.stringify({ 
                success: true, 
                chunk: delta,
                done: false 
              })}\n\n`);
            }
          } catch (e) {
            // 忽略解析错误
          }
        }
      }
    }

    // 发送最终结果
    res.write(`data: ${JSON.stringify({
      success: true,
      description: `${product}${features ? ` - ${features}` : ''}`,
      copywriting: fullContent,
      tone,
      done: true
    })}\n\n`);
    res.end();

  } catch (error) {
    console.error('流式处理失败:', error);
    res.write(`data: ${JSON.stringify({ 
      success: false,
      error: '流式处理失败', 
      details: error.message 
    })}\n\n`);
    res.end();
  }
}