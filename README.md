# AI 文案生成器 (ImagineForge)

基于智谱 AI（GLM-4.6V）的多模态文案生成工具，支持图片识别生成文案和文字描述生成文案两种模式。**专为 Vercel 部署优化**。

## 功能

- **文案生成**：输入产品描述，AI 根据描述生成多风格文案
- **图片生成**：输入提示词，AI 生成高质量图片
- **多风格支持**：专业、友好、创意、幽默等多种文案风格
- **流式响应**：实时显示生成结果，提升用户体验

## 技术栈

- 前端：React 19 + TypeScript + Vite 8 + Tailwind CSS 4
- 后端：Vercel Serverless Functions (Node.js/TypeScript)
- AI：智谱 GLM-4.6V（文案生成）/ GPT-Image-2（图片生成）

## 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=YOUR_REPO_URL&env=ZHIPU_API_KEY,MANXIAOBAI_API_KEY&envDescription=AI%20API%20Keys&envLink=https%3A%2F%2Fbigmodel.cn%20and%20https%3A%2F%2Fapi.manxiaobai.online)

### 手动部署步骤

1. **Fork 或克隆本仓库**
2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
3. **配置环境变量**
   - 在 Vercel 项目设置中，添加以下环境变量：
     - `ZHIPU_API_KEY`：智谱 AI API Key（去 https://bigmodel.cn 注册获取）
     - `MANXIAOBAI_API_KEY`：图片生成 API Key（去 https://api.manxiaobai.online 注册获取）
4. **立即部署**
   - 点击 Deploy，1分钟后网站就上线了

## 本地开发

### 1. 安装依赖

```bash
cd client
npm install
```

### 2. 配置 API Key

复制 `.env.example` 为 `.env`，填入你的 API Key：

```bash
cp .env.example .env
```

然后编辑 `.env` 文件，替换为你的真实 API Key。

### 3. 启动本地开发服务器

```bash
cd client
npm run dev
```

访问 http://localhost:3000 即可开发。

## 项目结构

```
ai-copywriter/
├── api/                    # Vercel Serverless Functions
│   ├── generate-text.ts    # 文案生成 API
│   ├── generate-image.ts   # 图片生成 API
│   └── proxy-download.ts   # 图片下载代理
├── client/                 # React 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── types/          # TypeScript 类型定义
│   └── vite.config.ts      # Vite 配置
├── vercel.json             # Vercel 部署配置
├── .env.example            # 环境变量模板
├── .gitignore              # Git 忽略规则
└── README.md               # 说明文档
```

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `ZHIPU_API_KEY` | 智谱 AI API Key | 是 |
| `MANXIAOBAI_API_KEY` | 图片生成 API Key | 是 |

## 注意事项

1. **API Key 安全**：`.env` 文件已排除，不会上传到 GitHub
2. **图片大小限制**：建议小于 5MB，base64 编码后不超过 10MB
3. **免费额度**：智谱 API 和图片生成 API 都有免费额度，超出后需付费
4. **部署配置**：本项目仅支持 Vercel 部署，其他平台的配置文件已清理