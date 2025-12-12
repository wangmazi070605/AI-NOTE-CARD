"use client";

import Link from "next/link";

const tools = [
  {
    id: "emotion",
    title: "💭 情感分析",
    description: "AI 心理镜像，解读你的内心世界",
    icon: "🔮",
    href: "/emotion",
    color: "from-blue-500 to-purple-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
  },
  {
    id: "daily-fortune",
    title: "✨ 今日运势",
    description: "每天早上看一眼，开启美好一天",
    icon: "✨",
    href: "/daily-fortune",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
  },
  {
    id: "personality",
    title: "🧬 AI 人格测试",
    description: "5轮对话，生成全网唯一的人格卡片",
    icon: "🧬",
    href: "/personality",
    color: "from-green-500 to-cyan-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-black dark:via-zinc-950 dark:to-black">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12">
        {/* 标题区域 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI 解读你的内心世界
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
            探索 AI 驱动的智能工具
          </p>
        </div>

        {/* 工具卡片网格 */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.02]"
            >
              {/* 背景渐变 */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              {/* 内容 */}
              <div className="relative p-4">
                {/* 标题 */}
                <h2 className="text-base font-bold mb-2 text-zinc-900 dark:text-zinc-50 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all duration-300">
                  {tool.title}
                </h2>

                {/* 描述 */}
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-2 line-clamp-2">
                  {tool.description}
                </p>

                {/* 箭头 */}
                <div className="flex items-center text-xs font-medium text-zinc-500 dark:text-zinc-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  <span>开始使用</span>
                  <svg
                    className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              {/* 悬停光效 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </Link>
          ))}
        </div>

        {/* 底部说明 */}
        <div className="mt-12 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-500">
            由 DeepSeek AI 驱动 · 安全私密 · 免费使用
          </p>
        </div>
      </main>
    </div>
  );
}
