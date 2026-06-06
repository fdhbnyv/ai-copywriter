"""
AI文案生成器 - 后端服务
接入智谱 GLM-4.6V 多模态 API
部署到 Railway
"""

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ZHIPU_API_KEY = os.environ.get('ZHIPU_API_KEY', '')
ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
MODEL = 'glm-4.6v'

SYSTEM_PROMPT = """你是一位专业的营销文案撰写专家。请根据用户提供的产品信息和特点，生成吸引人的营销文案。

要求：
1. 文案要简洁有力，突出产品卖点
2. 语言风格要符合用户选择的文案风格
3. 包含标题和正文，适当使用 emoji 增加吸引力
4. 最后给出购买建议或行动号召

请直接输出文案内容，不需要额外说明。"""

TONE_PROMPTS = {
    'professional': '请以专业商务风格撰写，语气正式、权威，适合企业级产品。',
    'friendly': '请以亲切友好风格撰写，语气温暖、真诚，像朋友推荐好物一样。',
    'creative': '请以创意潮流风格撰写，语言活泼有创意，适合年轻用户群体。',
    'persuasive': '请以说服营销风格撰写，突出性价比和紧迫感，促使用户立即购买。',
}


def generate_prompt(product: str, features: str, tone: str, image_base64: str = None) -> list:
    """构建智谱 API 的请求消息"""
    tone_prompt = TONE_PROMPTS.get(tone, TONE_PROMPTS['professional'])
    
    user_content = []
    
    if image_base64:
        user_content.append({
            'type': 'image_url',
            'image_url': {
                'url': image_base64
            }
        })
    
    text = f"""产品信息：
产品名称：{product}
产品特点：{features}

{tone_prompt}

请为以下产品生成营销文案：
产品名称：{product}
产品特点：{features}"""
    
    user_content.append({
        'type': 'text',
        'text': text
    })
    
    return [
        {'role': 'system', 'content': SYSTEM_PROMPT},
        {'role': 'user', 'content': user_content}
    ]


def call_zhipu_api(messages: list) -> str:
    """调用智谱 GLM-4.6V API"""
    headers = {
        'Authorization': f'Bearer {ZHIPU_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': MODEL,
        'messages': messages,
        'max_tokens': 2048,
        'temperature': 0.7,
    }
    
    response = requests.post(ZHIPU_API_URL, headers=headers, json=data, timeout=60)
    
    if response.status_code != 200:
        raise Exception(f'智谱 API 请求失败: {response.status_code} - {response.text}')
    
    result = response.json()
    
    if 'choices' not in result or not result['choices']:
        raise Exception('智谱 API 返回格式异常')
    
    return result['choices'][0]['message']['content']


@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    """纯文本生成文案"""
    try:
        data = request.json
        product = data.get('product', '').strip()
        features = data.get('features', '').strip()
        tone = data.get('tone', 'professional')
        
        if not product:
            return jsonify({'error': '请输入产品名称'}), 400
        
        messages = generate_prompt(product, features, tone)
        copywriting = call_zhipu_api(messages)
        
        return jsonify({'copywriting': copywriting})
    
    except Exception as e:
        return jsonify({'error': f'生成失败: {str(e)}'}), 500


@app.route('/api/generate-image-text', methods=['POST'])
def generate_image_text():
    """图片+文本生成文案（多模态）"""
    try:
        data = request.json
        product = data.get('product', '').strip()
        features = data.get('features', '').strip()
        tone = data.get('tone', 'professional')
        image_base64 = data.get('image', '')
        
        if not product and not image_base64:
            return jsonify({'error': '请输入产品名称或上传图片'}), 400
        
        product_name = product or '（请根据图片判断）'
        features_text = features or ''
        
        messages = generate_prompt(product_name, features_text, tone, image_base64)
        copywriting = call_zhipu_api(messages)
        
        return jsonify({'copywriting': copywriting})
    
    except Exception as e:
        return jsonify({'error': f'生成失败: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'status': 'running',
        'model': MODEL,
        'message': 'AI文案生成器后端服务运行中'
    })


if __name__ == '__main__':
    print('\n' + '=' * 60)
    print('  AI文案生成器 - 后端服务已启动！')
    print(f'  模型: {MODEL}')
    print(f'  地址: http://localhost:5000')
    print('=' * 60 + '\n')
    app.run(host='0.0.0.0', port=5000, debug=True)
