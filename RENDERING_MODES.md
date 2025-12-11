# Next.js 渲染模式控制指南

## 📚 渲染模式概览

Next.js 支持多种渲染模式，每种模式有不同的特点和适用场景：

| 渲染模式 | 全称 | 特点 | 适用场景 |
|---------|------|------|---------|
| **SSR** | Server-Side Rendering | 每次请求都在服务器渲染 | 动态内容、需要实时数据 |
| **SSG** | Static Site Generation | 构建时生成静态 HTML | 内容不经常变化 |
| **ISR** | Incremental Static Regeneration | 静态生成 + 定时更新 | 内容偶尔更新 |
| **CSR** | Client-Side Rendering | 在浏览器中渲染 | 交互性强、需要状态管理 |

---

## 🎯 当前项目的渲染模式

### app/layout.tsx（Server Component - 默认 SSR）

```typescript
// 没有 "use client" 指令 = Server Component
export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
```

**渲染方式**：SSR（服务器端渲染）
- 每次请求都在服务器渲染
- 返回完整的 HTML 到浏览器

### app/page.tsx（Client Component - CSR）

```typescript
"use client";  // ← 这个指令表示客户端组件

export default function Home() {
  const [inputText, setInputText] = useState("");
  // ...
}
```

**渲染方式**：CSR（客户端渲染）
- 初始 HTML 由服务器生成（SSR）
- React 在浏览器中接管（Hydration）
- 后续交互在客户端处理

---

## 🔧 如何控制渲染模式

### 1. Server Component（默认 - SSR）

**特点**：
- 在服务器端执行
- 可以访问数据库、API、文件系统
- 不能使用浏览器 API（如 `window`、`localStorage`）
- 不能使用 React Hooks（`useState`、`useEffect` 等）

**示例**：
```typescript
// app/blog/page.tsx
// 没有 "use client" = Server Component

export default async function BlogPage() {
  // 可以在服务器端获取数据
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  
  return (
    <div>
      {posts.map(post => <div key={post.id}>{post.title}</div>)}
    </div>
  );
}
```

**渲染流程**：
```
用户请求 → 服务器执行组件 → 生成 HTML → 返回给浏览器
```

---

### 2. Client Component（CSR）

**特点**：
- 在浏览器中执行
- 可以使用 React Hooks
- 可以使用浏览器 API
- 可以处理用户交互

**如何启用**：
```typescript
"use client";  // ← 必须放在文件顶部

export default function MyComponent() {
  const [count, setCount] = useState(0);
  // ...
}
```

**渲染流程**：
```
用户请求 → 服务器生成初始 HTML → 浏览器接收 → React Hydration → 客户端交互
```

---

### 3. Static Site Generation（SSG）

**特点**：
- 构建时生成静态 HTML
- 访问速度最快
- 内容在构建时确定

**如何启用**：

#### 方法 1：使用 `generateStaticParams`（动态路由）

```typescript
// app/blog/[id]/page.tsx
export async function generateStaticParams() {
  // 构建时获取所有可能的 ID
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());
  
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`).then(r => r.json());
  
  return <div>{post.title}</div>;
}
```

#### 方法 2：强制静态生成

```typescript
// app/about/page.tsx
export const dynamic = 'force-static';  // ← 强制静态生成

export default function AboutPage() {
  return <div>关于我们</div>;
}
```

**渲染流程**：
```
构建时 → 生成所有页面的 HTML → 部署 → 用户访问时直接返回静态文件
```

---

### 4. Incremental Static Regeneration（ISR）

**特点**：
- 静态生成 + 定时更新
- 首次访问生成静态页面
- 定时重新生成（后台）

**如何启用**：

```typescript
// app/blog/[id]/page.tsx
export const revalidate = 3600;  // ← 每 3600 秒（1小时）重新生成

export default async function BlogPost({ params }: { params: { id: string } }) {
  const post = await fetch(`https://api.example.com/posts/${params.id}`, {
    next: { revalidate: 3600 }  // 也可以在这里设置
  }).then(r => r.json());
  
  return <div>{post.title}</div>;
}
```

**渲染流程**：
```
首次访问 → 生成静态页面 → 缓存
定时更新 → 后台重新生成 → 更新缓存
后续访问 → 返回缓存的静态页面
```

---

## 📊 渲染模式对比

### 性能对比

```
SSG (最快)
  ↓
ISR (很快)
  ↓
SSR (中等)
  ↓
CSR (较慢，首次加载)
```

### 数据获取时机

| 模式 | 数据获取时机 | 数据新鲜度 |
|------|------------|-----------|
| SSG | 构建时 | 构建时的数据 |
| ISR | 构建时 + 定时更新 | 可配置的新鲜度 |
| SSR | 每次请求时 | 实时数据 |
| CSR | 浏览器中 | 实时数据（需要 API） |

---

## 🎨 当前项目的渲染策略

### 当前配置分析

```
app/layout.tsx
  └─ Server Component (SSR)
      └─ 每次请求都在服务器渲染 HTML 结构

app/page.tsx
  └─ Client Component (CSR)
      └─ 初始 HTML 由服务器生成
      └─ React 在浏览器中接管（Hydration）
      └─ 用户交互在客户端处理
```

### 混合渲染的优势

1. **layout.tsx (SSR)**：
   - 快速返回 HTML 结构
   - SEO 友好
   - 首屏加载快

2. **page.tsx (CSR)**：
   - 支持交互（输入、点击）
   - 可以使用 React Hooks
   - 动态更新 UI

---

## 🔄 如何切换渲染模式

### 示例 1：将页面改为 SSG

```typescript
// app/about/page.tsx
export const dynamic = 'force-static';  // 强制静态生成

export default function AboutPage() {
  return <div>关于我们</div>;
}
```

### 示例 2：将页面改为 ISR

```typescript
// app/blog/page.tsx
export const revalidate = 60;  // 每 60 秒重新生成

export default async function BlogPage() {
  const posts = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }
  }).then(r => r.json());
  
  return <div>{/* 渲染博客列表 */}</div>;
}
```

### 示例 3：将组件改为 Server Component

```typescript
// app/components/ServerData.tsx
// 移除 "use client"，直接使用 async/await

export default async function ServerData() {
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  
  return <div>{data.title}</div>;
}
```

---

## 🛠️ 实际应用场景

### 场景 1：博客文章（适合 SSG 或 ISR）

```typescript
// app/blog/[slug]/page.tsx
export const revalidate = 3600;  // 每小时更新

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}
```

### 场景 2：用户仪表板（适合 SSR）

```typescript
// app/dashboard/page.tsx
// 没有 "use client"，使用 Server Component

export default async function Dashboard() {
  const user = await getCurrentUser();  // 服务器端获取用户数据
  const data = await getUserData(user.id);
  
  return <div>欢迎，{user.name}</div>;
}
```

### 场景 3：交互式表单（适合 CSR）

```typescript
// app/contact/page.tsx
"use client";

export default function ContactForm() {
  const [formData, setFormData] = useState({});
  // 处理表单交互
  return <form>{/* 表单内容 */}</form>;
}
```

---

## 📝 关键配置选项

### 1. `dynamic` 选项

```typescript
// 强制静态生成
export const dynamic = 'force-static';

// 强制动态渲染（每次请求都渲染）
export const dynamic = 'force-dynamic';

// 自动选择（默认）
export const dynamic = 'auto';
```

### 2. `revalidate` 选项

```typescript
// ISR：每 60 秒重新生成
export const revalidate = 60;

// 或者在 fetch 中设置
fetch(url, { next: { revalidate: 60 } });
```

### 3. `generateStaticParams` 函数

```typescript
// 为动态路由生成静态参数
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }];
}
```

---

## 🎯 当前项目的最佳实践

### 当前项目的渲染策略

1. **layout.tsx**：Server Component（SSR）
   - ✅ 快速返回 HTML 结构
   - ✅ SEO 友好

2. **page.tsx**：Client Component（CSR）
   - ✅ 支持用户交互
   - ✅ 可以使用 React Hooks
   - ✅ 动态更新 UI

3. **actions.ts**：Server Action
   - ✅ 在服务器端执行
   - ✅ 可以安全访问环境变量
   - ✅ 调用外部 API

### 优化建议

如果需要更好的 SEO，可以考虑：

```typescript
// app/page.tsx
// 将部分内容改为 Server Component

// Server Component（获取初始数据）
async function InitialContent() {
  // 可以在服务器端获取一些初始数据
  return <div>初始内容</div>;
}

// Client Component（处理交互）
"use client";
export default function Home() {
  // 交互逻辑
  return (
    <div>
      <InitialContent />
      {/* 交互式内容 */}
    </div>
  );
}
```

---

## 🔍 如何检查当前渲染模式

### 开发环境

在浏览器开发者工具中查看：
- **Network 标签**：查看请求的响应头
  - `x-nextjs-cache: HIT` = 静态缓存
  - `x-nextjs-cache: MISS` = 动态渲染

### 生产环境

```bash
# 构建时查看
npm run build

# 输出会显示：
# ○ (Static)  - 静态生成
# ● (SSG)     - 静态站点生成
# λ (Dynamic) - 动态渲染
```

---

## 📚 总结

| 需求 | 推荐模式 | 配置方式 |
|------|---------|---------|
| 内容不变化 | SSG | `export const dynamic = 'force-static'` |
| 内容偶尔更新 | ISR | `export const revalidate = 3600` |
| 需要实时数据 | SSR | 默认（Server Component） |
| 需要交互 | CSR | `"use client"` |

当前项目使用了**混合渲染**：
- **SSR**（layout.tsx）：快速首屏
- **CSR**（page.tsx）：交互体验
- **Server Actions**：安全的数据处理

这是 Next.js App Router 的最佳实践！🎉

