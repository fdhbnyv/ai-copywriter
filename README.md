# AI 文案生成器

基于智谱 AI（GLM-4.6V）的多模态文案生成工具，支持图片识别生成文案和文字描述生成文案两种模式。**专为 Vercel 部署优化**。

## 功能

- **图片生成文案**：上传产品图片，AI 识别图片内容并生成营销文案
- **文字生成文案**：输入产品描述，AI 根据描述生成多风格文案

## 技术栈

- 前端：HTML + CSS + JavaScript
- 后端：Vercel Serverless Functions (Node.js)
- AI：智谱 GLM-4.6V（图片+文案）/ GLM-4 Flash（纯文字）

## 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ffdhbnyv%2F-&env=ZHIPU_API_KEY&envDescription=智谱AI%20API%20Key&envLink=https%3A%2F%2Fbigmodel.cn&project-name=ai-copywriter&repository-name=ai-copywriter)

### 手动部署步骤

1. **Fork 或克隆本仓库**
2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
3. **配置环境变量**
   - 在 Vercel 项目设置中，添加 `ZHIPU_API_KEY`
   - 值：你的智谱 API Key（去 https://bigmodel.cn 注册获取）
4. **立即部署**
   - 点击 Deploy，1分钟后网站就上线了

## 本地开发

### 1. 安装依赖（Node.js 环境）

```bash
npm install
```

或直接运行（无需安装）：

```bash
node api/generate.js
```

### 2. 配置 API Key

复制 `.env.example` 为 `.env`，填入你的智谱 API Key：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，将 `your_api_key_here` 替换为你的真实 API Key。

### 3. 启动本地服务器

```bash
# 使用 Python 简单服务器
python -m http.server 8000
```

或直接双击 `index.html` 用浏览器打开。

## 项目结构

```
ai-copywriter/
├── index.html          # 前端页面
├── api/
│   └── generate.js     # Vercel Serverless Function
├── vercel.json         # Vercel 配置文件
├── .env.example        # 环境变量模板
├── .gitignore          # Git 忽略规则
└── README.md           # 说明文档
```

## 注意事项

1. **API Key 安全**：`.env` 文件已排除，不会上传到 GitHub
2. **图片大小限制**：建议小于 5MB，base64 编码后不超过 10MB
3. **免费额度**：智谱 API 有免费额度，超出后需付费