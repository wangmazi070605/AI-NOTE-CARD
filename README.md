# AI 情绪小工具

一个基于 Next.js 16 和 DeepSeek AI 的智能情绪分析工具集，包含**情绪分析**和**性格检测**两大功能。

## ✨ 功能特性

### 1. 情绪分析（首页）
- 🤖 **AI 智能分析**：使用 DeepSeek API 分析用户输入的情绪
- 🎨 **动态主题**：根据情绪类型自动选择颜色和视觉效果
- 💫 **生成式 UI**：根据情绪动态生成背景效果（焦虑-灰色线条、恋爱脑-粉色泡泡等）
- 😈 **双模式**：毒舌模式 / 治愈模式

### 2. 性格检测（/personality）
- 💬 **5轮对话**：与 AI 进行 5 轮高强度对话
- 🎭 **多种人设**：贴吧老哥、茶里茶气、毒舌模式、可爱模式
- 🎴 **炫酷卡片**：生成全网唯一的性格卡片
- 📊 **雷达图**：可视化性格数据（内向、创造力、幽默、逻辑、共情、能量）
- 📱 **保存到相册**：使用 html2canvas 生成高清图片

## 🛠️ 技术栈

### 核心框架
- **Next.js 16** - React 全栈框架，使用 App Router
- **React 19** - UI 库
- **TypeScript** - 类型安全

### AI 集成
- **DeepSeek Chat API** - AI 模型服务
- **Server Actions** - 服务端 AI 调用

### 数据验证
- **Zod** - TypeScript 优先的 Schema 验证库

### UI 组件
- **Tailwind CSS 4** - 实用优先的 CSS 框架
- **Recharts** - 雷达图可视化
- **html2canvas** - 图片生成和下载

## 📁 项目结构

```
ai-note-card/
├── app/
│   ├── page.tsx              # 情绪分析首页
│   ├── personality/
│   │   └── page.tsx          # 性格检测页面
│   ├── actions.ts            # 情绪分析 Server Action
│   ├── actions/
│   │   └── personality.ts    # 性格检测 Server Action
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # 聊天 API 路由
│   └── layout.tsx            # 根布局
│
├── components/
│   └── SoulCard.tsx          # 性格卡片组件
│
├── lib/
│   └── schemas.ts            # Zod Schema 定义
│
└── package.json
```

## 🚀 快速开始

### 环境要求

- Node.js 20+
- npm / yarn / pnpm

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd ai-note-card
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**

在项目根目录创建 `.env.local` 文件：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

4. **启动开发服务器**
```bash
npm run dev
```

5. **打开浏览器**

访问 [http://localhost:3000](http://localhost:3000)

## 📖 使用说明

### 情绪分析（首页）

1. 输入你的碎碎念或聊天记录
2. 选择分析模式（毒舌/治愈）
3. 点击"生成诊断"按钮
4. 查看生成的"灵魂诊断报告"

### 性格检测（/personality）

1. 选择聊天模式（贴吧老哥/茶里茶气/毒舌/可爱）
2. 与 AI 进行 5 轮对话
3. 对话结束后，点击"生成成分查询报告"
4. 查看生成的性格卡片
5. 点击"保存到相册"下载高清图片

## 🎨 性格卡片特性

- **稀有度系统**：N / R / SR / SSR / UR
- **动态配色**：根据性格特征自动生成配色方案
- **噪点纹理**：赛博朋克风格背景
- **雷达图**：6 维性格数据可视化
- **毒舌判词**：犀利幽默的性格分析
- **社交货币**：适合分享到朋友圈

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
- `zod`: Schema 验证库
- `recharts`: 图表库
- `html2canvas`: 图片生成库

### 开发依赖
- `typescript`: TypeScript 编译器
- `tailwindcss`: Tailwind CSS 框架
- `eslint`: 代码检查工具

## 🚀 部署到 Vercel

### 步骤

1. **准备代码**
   ```bash
   git add .
   git commit -m "准备部署"
   git push origin main
   ```

2. **登录 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

3. **导入项目**
   - 点击 "Add New Project"
   - 选择你的 Git 仓库
   - Vercel 会自动检测 Next.js 项目

4. **设置环境变量**
   - 在 "Environment Variables" 部分添加：
     ```
     DEEPSEEK_API_KEY=your_deepseek_api_key_here
     ```
   - 点击 "Add" 保存

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成

6. **配置自定义域名（可选）**
   - 在 Vercel Dashboard → Project → Settings → Domains
   - 添加自定义域名
   - 按照提示配置 DNS 记录
   - 这样国内也可以访问了！

## 🔒 安全提示

- **API Key 安全**: 确保 `.env.local` 文件不会被提交到版本控制系统
- **环境变量**: 生产环境请使用安全的密钥管理服务

## 📝 许可证

本项目为私有项目。

---

**享受使用 AI 情绪小工具！** 🎉
