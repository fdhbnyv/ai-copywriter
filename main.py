"""
AI文案生成器 - 后端服务
接入智谱 GLM-4.6V 多模态 API
支持流式输出
部署到 Railway
"""

import os
import json
import sys
import requests
from flask import Flask, request, jsonify, Response, stream_with_context
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
3. 针对指定的目标群体进行精准营销
4. 根据发布平台调整文案格式和风格
5. 包含标题和正文，适当使用 emoji 增加吸引力
6. 最后给出购买建议或行动号召

请直接输出文案内容，不需要额外说明。"""

TONE_PROMPTS = {
    'professional': '请以专业商务风格撰写，语气正式、权威，适合企业级产品。',
    'friendly': '请以亲切友好风格撰写，语气温暖、真诚，像朋友推荐好物一样。',
    'creative': '请以创意潮流风格撰写，语言活泼有创意，适合年轻用户群体。',
    'persuasive': '请以说服营销风格撰写，突出性价比和紧迫感，促使用户立即购买。',
    'humorous': '请以幽默搞笑风格撰写，语言风趣幽默，让人会心一笑。',
    'lyrical': '请以文艺清新风格撰写，语言优美有诗意，适合文艺类产品。',
    'luxury': '请以高端奢华风格撰写，突出品质感和尊贵体验。',
    'tech': '请以科技极客风格撰写，突出技术参数和创新点。',
}

PLATFORM_PROMPTS = {
    'wechat': '请为微信公众号平台优化文案，适合长图文阅读，段落清晰。',
    'xiaohongshu': '请为小红书平台优化文案，适合种草分享风格，多用 emoji 和话题标签。',
    'douyin': '请为抖音/短视频平台优化文案，语言简洁有力，适合口播或字幕。',
    'taobao': '请为淘宝/电商平台优化文案，突出卖点和促销信息，适合商品详情页。',
    'weibo': '请为微博平台优化文案，简短有力，适合碎片化阅读。',
    'general': '请生成通用营销文案，适用于多种场景。',
}


def generate_prompt(product: str, features: str, tone: str, audience: str, platform: str, image_base64: str = None) -> list:
    """构建智谱 API 的请求消息"""
    tone_prompt = TONE_PROMPTS.get(tone, f'请以"{tone}"风格撰写文案。')
    platform_prompt = PLATFORM_PROMPTS.get(platform, PLATFORM_PROMPTS['general'])
    
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
目标群体：{audience if audience else '不限定特定群体'}
发布平台：{platform if platform else '通用'}

{tone_prompt}

{platform_prompt}

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


def call_zhipu_api_stream(messages: list):
    """调用智谱 GLM-4.6V API（流式）"""
    headers = {
        'Authorization': f'Bearer {ZHIPU_API_KEY}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'model': MODEL,
        'messages': messages,
        'max_tokens': 2048,
        'temperature': 0.7,
        'stream': True,
    }
    
    response = requests.post(ZHIPU_API_URL, headers=headers, json=data, timeout=120, stream=True)
    
    if response.status_code != 200:
        raise Exception(f'智谱 API 请求失败: {response.status_code}')
    
    for line in response.iter_lines():
        if line:
            line_str = line.decode('utf-8')
            if line_str.startswith('data: '):
                data_str = line_str[6:]
                if data_str == '[DONE]':
                    yield 'data: [DONE]\n\n'
                    sys.stdout.flush()
                    break
                try:
                    result = json.loads(data_str)
                    delta = result['choices'][0].get('delta', {})
                    content = delta.get('content', '')
                    if content:
                        yield f'data: {json.dumps({"content": content})}\n\n'
                        sys.stdout.flush()
                except json.JSONDecodeError:
                    continue


@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    """流式生成文案"""
    try:
        data = request.json
        product = data.get('product', '').strip()
        features = data.get('features', '').strip()
        tone = data.get('tone', 'professional')
        audience = data.get('audience', '').strip()
        platform = data.get('platform', '').strip()
        
        if not product:
            return jsonify({'error': '请输入产品名称'}), 400
        
        messages = generate_prompt(product, features, tone, audience, platform)
        
        return Response(
            stream_with_context(call_zhipu_api_stream(messages)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
                'Content-Type': 'text/event-stream',
            }
        )
    
    except Exception as e:
        return jsonify({'error': f'生成失败: {str(e)}'}), 500


@app.route('/api/generate-image-text', methods=['POST'])
def generate_image_text():
    """图片+文本流式生成文案（多模态）"""
    try:
        data = request.json
        product = data.get('product', '').strip()
        features = data.get('features', '').strip()
        tone = data.get('tone', 'professional')
        audience = data.get('audience', '').strip()
        platform = data.get('platform', '').strip()
        image_base64 = data.get('image', '')
        
        if not product and not image_base64:
            return jsonify({'error': '请输入产品名称或上传图片'}), 400
        
        product_name = product or '（请根据图片判断）'
        features_text = features or ''
        
        messages = generate_prompt(product_name, features_text, tone, audience, platform, image_base64)
        
        return Response(
            stream_with_context(call_zhipu_api_stream(messages)),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
                'Content-Type': 'text/event-stream',
            }
        )
    
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
