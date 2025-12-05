# AI 智能笔记卡片

一个基于 Next.js 和 AI 的智能笔记卡片生成应用，能够将用户的笔记内容自动整理成精美的卡片格式，支持根据内容情绪自动选择颜色主题。

## ✨ 功能特性

- 🤖 **AI 智能生成**：使用 DeepSeek API 自动分析笔记内容，生成精炼的标题、摘要和标签
- 🎨 **动态主题**：根据内容情绪自动选择 5 种颜色主题（blue、green、red、purple、yellow）
- 📱 **响应式设计**：完美适配桌面端和移动端
- 🌙 **深色模式**：支持系统深色模式
- 🎯 **类型安全**：使用 TypeScript 和 Zod Schema 确保数据类型安全
- 💫 **精美 UI**：类似 Instagram 分享图的现代化卡片设计

## 🛠️ 技术栈

### 核心框架
- **Next.js 16** - React 全栈框架，使用 App Router
- **React 19** - UI 库
- **TypeScript** - 类型安全

### AI 集成
- **Vercel AI SDK** (`ai`) - AI 应用开发工具包
- **@ai-sdk/openai** - OpenAI 兼容 SDK（用于 DeepSeek API）
- **DeepSeek Chat** - AI 模型服务

### 数据验证
- **Zod** - TypeScript 优先的 Schema 验证库

### 样式
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **PostCSS** - CSS 后处理器

### 开发工具
- **ESLint** - 代码质量检查
- **Next.js ESLint Config** - Next.js 官方 ESLint 配置

## 📁 项目架构

### 目录结构

```
ai-note-card/
├── app/                    # Next.js App Router 目录
│   ├── actions.ts         # Server Actions（AI 生成逻辑）
│   ├── layout.tsx         # 根布局组件
│   ├── page.tsx           # 主页面组件（客户端）
│   ├── globals.css        # 全局样式
│   └── favicon.ico        # 网站图标
│
├── lib/                    # 工具库和共享代码
│   └── schemas.ts         # Zod Schema 定义（卡片数据结构）
│
├── public/                 # 静态资源
│   └── *.svg              # SVG 图标文件
│
├── .env.local             # 环境变量（不提交到 Git）
├── next.config.ts         # Next.js 配置文件
├── tsconfig.json          # TypeScript 配置
├── postcss.config.mjs     # PostCSS 配置
├── eslint.config.mjs      # ESLint 配置
└── package.json           # 项目依赖和脚本
```

### 架构设计

```
┌─────────────────────────────────────────────────┐
│            Client Component (page.tsx)          │
│  - 用户输入界面                                  │
│  - 卡片预览展示                                  │
│  - 状态管理（loading, error, card）              │
└──────────────────┬──────────────────────────────┘
                   │
                   │ 调用 Server Action
                   ▼
┌─────────────────────────────────────────────────┐
│         Server Action (actions.ts)              │
│  - 接收用户输入                                   │
│  - 调用 AI API (DeepSeek)                        │
│  - 使用 Zod Schema 验证返回数据                   │
└──────────────────┬──────────────────────────────┘
                   │
                   │ 使用 Schema 验证
                   ▼
┌─────────────────────────────────────────────────┐
│         Zod Schema (lib/schemas.ts)            │
│  - 定义卡片数据结构                               │
│  - 类型安全验证                                   │
│  - TypeScript 类型推断                            │
└─────────────────────────────────────────────────┘
```

## 📄 文件说明

### 核心文件

#### `app/page.tsx`
主页面组件，包含：
- 左侧输入区域（Textarea + 生成按钮）
- 右侧卡片预览区域
- 状态管理（输入文本、加载状态、卡片数据、错误信息）
- 动态主题样式应用
- 响应式布局

#### `app/actions.ts`
Server Action，负责：
- 连接 DeepSeek API
- 调用 AI 生成结构化数据
- 使用 Zod Schema 验证返回数据
- 错误处理

#### `lib/schemas.ts`
数据 Schema 定义：
- `cardSchema`: Zod Schema，定义卡片数据结构
  - `title`: 精炼标题（string）
  - `summary`: 内容摘要（string）
  - `tags`: 3 个标签（string[]）
  - `colorTheme`: 颜色主题（enum: blue/green/red/purple/yellow）
  - `borderColor`: 边框颜色（hex 颜色值）
- `Card`: TypeScript 类型（从 Schema 推断）

#### `app/layout.tsx`
根布局组件：
- 配置字体（Geist Sans、Geist Mono）
- 全局样式引入
- HTML 结构定义

#### `app/globals.css`
全局样式：
- Tailwind CSS 导入
- CSS 变量定义（主题颜色）
- 深色模式支持

### 配置文件

- `next.config.ts`: Next.js 配置
- `tsconfig.json`: TypeScript 编译配置
- `postcss.config.mjs`: PostCSS 配置（Tailwind CSS）
- `eslint.config.mjs`: ESLint 代码检查配置
- `.env.local`: 环境变量（需自行创建，不提交到 Git）

## 🚀 快速开始

### 环境要求

- Node.js 18+ 
- npm / yarn / pnpm / bun

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-note-card
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

3. **配置环境变量**

在项目根目录创建 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

> **注意**：`.env.local` 文件已包含在 `.gitignore` 中，不会被提交到版本控制。

4. **启动开发服务器**
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

5. **打开浏览器**

访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用说明

1. **输入笔记内容**
   - 在左侧文本框中输入你的笔记内容
   - 支持多行文本输入

2. **生成卡片**
   - 点击"生成卡片"按钮
   - 等待 AI 处理（按钮会显示"正在思考..."）

3. **查看结果**
   - 右侧会显示生成的精美卡片
   - 卡片包含：标题、摘要、3 个标签
   - 颜色主题会根据内容情绪自动选择

## 🎨 颜色主题说明

AI 会根据笔记内容的情绪自动选择颜色主题：

- **Blue（蓝色）**: 平静、专业的内容
- **Green（绿色）**: 积极、成长相关的内容
- **Red（红色）**: 重要、紧急的内容
- **Purple（紫色）**: 创意、灵感相关的内容
- **Yellow（黄色）**: 提醒、注意相关的内容

## 🔧 开发脚本

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 运行代码检查
npm run lint
```

## 📦 项目依赖

### 生产依赖
- `next`: Next.js 框架
- `react` & `react-dom`: React 库
- `ai`: Vercel AI SDK
- `@ai-sdk/openai`: OpenAI 兼容 SDK
- `zod`: Schema 验证库

### 开发依赖
- `typescript`: TypeScript 编译器
- `tailwindcss`: Tailwind CSS 框架
- `@tailwindcss/postcss`: Tailwind PostCSS 插件
- `eslint`: 代码检查工具
- `eslint-config-next`: Next.js ESLint 配置

## 🔒 安全提示

- **API Key 安全**: 确保 `.env.local` 文件不会被提交到版本控制系统
- **环境变量**: 生产环境请使用安全的密钥管理服务

## 📝 许可证

本项目为私有项目。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 🔄 代码流程

### 前端流程 (`app/page.tsx`)

1. **用户输入** → Textarea 组件收集笔记内容
2. **点击按钮** → 触发 `handleGenerate()` 函数
3. **状态更新** → 设置 `isLoading = true`，显示"正在思考..."
4. **调用后端** → 执行 `generateCardContent(inputText)` Server Action
5. **接收数据** → 获取返回的 `Card` 对象
6. **更新 UI** → 设置 `card` 状态，根据 `colorTheme` 应用样式，渲染卡片

### 后端流程 (`app/actions.ts`)

1. **接收输入** → Server Action 接收用户输入的文本
2. **创建客户端** → 使用 DeepSeek API 配置创建 OpenAI 兼容客户端
3. **调用 AI** → 使用 `generateObject()` 调用 DeepSeek API，传入 `cardSchema` 和 prompt
4. **数据验证** → Zod Schema 自动验证返回的数据结构
5. **返回结果** → 返回符合 `Card` 类型的对象

### 数据流

```
用户输入 → 前端组件 → Server Action → DeepSeek API → Zod 验证 → 返回前端 → 更新 UI
```

## 🚀 部署流程（Vercel）

### 方式一：通过 Vercel Dashboard 部署

1. **准备代码**
   ```bash
   # 确保代码已提交到 Git 仓库（GitHub、GitLab 或 Bitbucket）
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub/GitLab/Bitbucket 账号登录

3. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 Git 仓库
   - Vercel 会自动检测 Next.js 项目

4. **配置项目**
   - **Framework Preset**: Next.js（自动检测）
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（默认）
   - **Output Directory**: `.next`（默认）

5. **设置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     DEEPSEEK_API_KEY=your_deepseek_api_key_here
     ```
   - 点击 "Add" 保存

6. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（通常 1-2 分钟）
   - 部署成功后获得项目 URL

### 方式二：通过 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   # 在项目根目录执行
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add DEEPSEEK_API_KEY
   # 输入你的 API Key
   ```

5. **生产环境部署**
   ```bash
   vercel --prod
   ```

### 部署后配置

1. **环境变量验证**
   - 在 Vercel Dashboard → Project → Settings → Environment Variables
   - 确认 `DEEPSEEK_API_KEY` 已正确设置
   - 确保应用到 Production、Preview、Development 环境

2. **域名配置（可选）**
   - 在 Vercel Dashboard → Project → Settings → Domains
   - 添加自定义域名
   - 按照提示配置 DNS 记录

3. **自动部署**
   - 每次推送到主分支会自动触发部署
   - 可以在 Vercel Dashboard 查看部署历史

### 常见问题

**问题：部署后 API 调用失败**
- 检查环境变量是否已正确设置
- 确认 `DEEPSEEK_API_KEY` 在 Production 环境中存在
- 重新部署项目使环境变量生效

**问题：构建失败**
- 检查 `package.json` 中的依赖是否正确
- 查看 Vercel 构建日志定位错误
- 确保 Node.js 版本兼容（Vercel 默认使用 Node.js 18+）

**问题：本地和部署环境不一致**
- 确保 `.env.local` 中的变量已添加到 Vercel
- 检查 `next.config.ts` 配置是否正确

### 部署检查清单

- [ ] 代码已推送到 Git 仓库
- [ ] 环境变量 `DEEPSEEK_API_KEY` 已配置
- [ ] 构建命令测试通过（`npm run build`）
- [ ] 本地测试正常（`npm run dev`）
- [ ] 部署后访问网站测试功能

---

**享受使用 AI 智能笔记卡片！** 🎉

