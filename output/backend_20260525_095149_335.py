"""
AI文案生成器 - 后端服务（智谱多模态API版）
API Key: b1d463463a674e28b1ce3178423ecfa8.2LULwIBrIwCiz0o4
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import base64
import requests
import json
import os

app = Flask(__name__)
CORS(app)  # 允许前端跨域访问

# 智谱 API 配置
ZHIPU_API_KEY = "b1d463463a674e28b1ce3178423ecfa8.2LULwIBrIwCiz0o4"
ZHIPU_API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions"

# ============================================================
# 1. 图片上传生成文案接口
# ============================================================

@app.route('/api/generate-from-image', methods=['POST'])
def generate_from_image():
    try:
        # 1. 接收图片文件
        if 'image' not in request.files:
            return jsonify({"error": "请上传图片文件"}), 400
        
        image_file = request.files['image']
        tone = request.form.get('tone', '专业商务风')
        
        # 检查文件大小（限制10MB）
        image_file.seek(0, os.SEEK_END)
        file_size = image_file.tell()
        image_file.seek(0)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            return jsonify({"error": "图片文件过大，请上传小于10MB的图片"}), 400
        
        # 2. 将图片转为base64
        image_data = image_file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # 3. 调用智谱多模态API
        description, copywriting = call_zhipu_vision_api(image_base64, tone)
        
        # 4. 返回结果
        return jsonify({
            "description": description,
            "copywriting": copywriting,
            "tone": tone
        })
        
    except Exception as e:
        return jsonify({"error": f"生成失败: {str(e)}"}), 500

# ============================================================
# 2. 文字输入生成文案接口（保持原有功能）
# ============================================================

@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    try:
        data = request.json
        product = data.get('product', '')
        features = data.get('features', '')
        tone = data.get('tone', '专业商务风')
        
        if not product:
            return jsonify({"error": "请输入产品名称"}), 400
        
        # 调用智谱文本API
        copywriting = call_zhipu_text_api(product, features, tone)
        
        return jsonify({"copywriting": copywriting})
        
    except Exception as e:
        return jsonify({"error": f"生成失败: {str(e)}"}), 500

# ============================================================
# 3. 智谱多模态API调用（图片+文字）
# ============================================================

def call_zhipu_vision_api(image_base64, tone):
    """
    调用智谱GLM-4.6V-Flash多模态模型
    免费版本，支持图片理解和文案生成
    """
    
    prompt = f"""请根据这张产品图片完成以下任务：

1. 首先，用一句话描述图片中的产品是什么，有什么特点
2. 然后，根据这个产品写一段{tone}的营销文案

要求：
- 文案要吸引人，突出产品卖点
- 长度在150-300字之间
- 风格要符合{tone}的特点

请按以下格式输出：
【产品描述】你的描述
【营销文案】你的文案"""
    
    headers = {
        "Authorization": f"Bearer {ZHIPU_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "glm-4.6v",  # 付费旗舰版多模态模型
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{image_base64}"
                        }
                    },
                    {
                        "type": "text",
                        "text": prompt
                    }
                ]
            }
        ],
        "temperature": 0.7,
        "max_tokens": 1000
    }
    
    # 添加重试机制
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = requests.post(ZHIPU_API_URL, headers=headers, json=payload, timeout=30)
            
            if response.status_code == 429:  # 频率限制
                if attempt < max_retries - 1:
                    wait_time = (attempt + 1) * 2  # 指数退避：2,4,6秒
                    print(f"API频率限制，等待{wait_time}秒后重试...")
                    import time
                    time.sleep(wait_time)
                    continue
                else:
                    return "AI识别了图片内容", "【免费API调用受限】\n\n当前使用的智谱免费API有频率限制，请稍后再试。\n\n或者您可以：\n1. 切换到文字模式手动输入产品信息\n2. 等待1-2分钟后再试\n3. 使用自己的付费API密钥替换当前免费密钥"
            
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # 解析返回内容
            lines = content.split('\n')
            description = ""
            copywriting = ""
            
            for line in lines:
                if line.startswith("【产品描述】"):
                    description = line.replace("【产品描述】", "").strip()
                elif line.startswith("【营销文案】"):
                    copywriting = line.replace("【营销文案】", "").strip()
            
            # 如果没按格式返回，就整个作为文案
            if not copywriting:
                copywriting = content
            
            if not description:
                description = "AI识别了图片内容并生成了文案"
            
            return description, copywriting
            
        except requests.exceptions.RequestException as e:
            if attempt < max_retries - 1:
                print(f"API调用失败，重试中... ({e})")
                import time
                time.sleep(2)
            else:
                raise e

# ============================================================
# 4. 智谱文本API调用（纯文字）
# ============================================================

def call_zhipu_text_api(product, features, tone):
    """
    调用智谱文本模型生成文案
    使用免费模型
    """
    
    prompt = f"""请为以下产品写一段{tone}的营销文案：

产品名称：{product}
产品特点：{features if features else "未提供具体特点"}

要求：
1. 文案要吸引目标客户
2. 突出产品优势和卖点
3. 长度在150-300字之间
4. 风格要符合{tone}的特点

请直接输出文案内容，不要加其他说明。"""
    
    headers = {
        "Authorization": f"Bearer {ZHIPU_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "glm-4-flash",  # 免费文本模型
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.7,
        "max_tokens": 800
    }
    
    response = requests.post(ZHIPU_API_URL, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    
    result = response.json()
    return result["choices"][0]["message"]["content"]

# ============================================================
# 5. 健康检查接口
# ============================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "running",
        "message": "AI文案生成器后端服务运行中",
        "api": "智谱GLM-4.6V-Flash（免费）",
        "features": ["图片上传生成文案", "文字输入生成文案"]
    })

# ============================================================
# 启动服务
# ============================================================

if __name__ == '__main__':
    print("\n" + "=" * 70)
    print("  🚀 AI文案生成器 - 后端服务已启动！")
    print("  地址: http://localhost:5000")
    print("  API接口: http://localhost:5000/api/generate-from-image")
    print("  API接口: http://localhost:5000/api/generate-text")
    print("  使用模型: 智谱GLM-4.6V-Flash（免费多模态）")
    print("  前端文件: frontend_20260525_093959_204.html")
    print("=" * 70 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)