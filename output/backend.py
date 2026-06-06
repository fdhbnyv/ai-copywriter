"""
AI文案生成器 - 后端服务
直接运行: python backend.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许前端跨域访问


# ============================================================
# 这里是你的API接口 —— 前端通过 fetch() 调用的就是这个地址
# 
# 前端发送: POST http://localhost:5000/api/generate-text
#            body: {"product": "蓝牙耳机", "features": "降噪", "tone": "professional"}
# 
# 后端返回: {"copywriting": "生成的文案内容..."}
# ============================================================

@app.route('/api/generate-text', methods=['POST'])
def generate_text():
    # 第一步：拿到前端传来的数据
    data = request.json
    product = data.get('product', '产品')
    features = data.get('features', '')
    tone = data.get('tone', 'professional')

    # 第二步：根据风格选择不同的文案模板（Demo版本用模板模拟）
    # 真实上线时，这里替换成调用大模型API
    copywriting = generate_demo_copywriting(product, features, tone)

    # 第三步：把结果打包成JSON返回给前端
    return jsonify({"copywriting": copywriting})


# ============================================================
# Demo版本的文案生成逻辑（模板模拟）
# 真实使用时，把下面函数替换成调用大模型API：
#   例如: openai.ChatCompletion.create() 或 requests.post(文心一言API)
# ============================================================

def generate_demo_copywriting(product, features, tone):
    """根据产品信息和风格生成文案（Demo模拟版本）"""
    
    tone_templates = {
        "professional": {
            "title": f"【{product}】专业级解决方案",
            "body": f"{product} — 以卓越品质定义行业新标准。\n\n核心优势：\n• {features}\n• 严苛品控体系，通过多项国际认证\n• 持续技术迭代，保持行业领先\n\n适用于：企业采购、专业场景、对品质有高要求的用户群体。\n\n[立即咨询，获取专属行业解决方案]",
        },
        "friendly": {
            "title": f"终于找到你了！{product}真的太懂我了 😊",
            "body": f"最近体验了{product}，忍不住要分享给大家！\n\n首先最打动我的是{features}，真的解决了我的痛点！用起来特别顺手，细节处理得很贴心。\n\n不管你是学生党还是上班族，这款产品都能给你带来惊喜。好物不私藏，真心推荐！\n\n[点击了解更多]",
        },
        "creative": {
            "title": f"当{product}遇上未来科技",
            "body": f"打破常规，重新想象。\n\n{product}不只是一款产品，更是一种生活方式的选择。\n\n🔥 {features}\n🔥 极简设计 × 极致体验\n🔥 为每一个不安分的灵魂而生\n\n这个世界不缺产品，缺的是懂你的那个。\n\n[立即探索 →]",
        },
        "persuasive": {
            "title": f"为什么越来越多人选择{product}？",
            "body": f"还在纠结？看完这几点你就懂了：\n\n① {features} — 行业首创技术，效果立竿见影\n② 性价比超高 — 同等配置市场价的一半\n③ 30天无忧退换 — 不满意全额退款\n\n限时福利：前100名下单送专属配件礼包！\n\n别犹豫了，好产品经得起对比。\n\n[立即下单，享限时优惠]",
        },
    }
    
    template = tone_templates.get(tone, tone_templates["professional"])
    
    return f"{template['title']}\n\n{'─' * 40}\n\n{template['body']}\n\n{'─' * 40}\n\n💡 提示：这是Demo版本的模拟生成结果。接入真实大模型API后，AI会根据你的产品信息动态生成更精准的文案。"


# ============================================================
# 健康检查接口（可选）：确认后端是否在运行
# ============================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "running", "message": "AI文案生成器后端服务运行中"})


if __name__ == '__main__':
    import sys
    if sys.stdout.encoding == 'gbk':
        sys.stdout.reconfigure(encoding='utf-8')
    print("\n" + "=" * 60)
    print("  AI文案生成器 - 后端服务已启动！")
    print("  地址: http://localhost:5000")
    print("  API接口: http://localhost:5000/api/generate-text")
    print("  现在可以打开前端页面来体验了")
    print("=" * 60 + "\n")
    app.run(host='0.0.0.0', port=5000, debug=True)