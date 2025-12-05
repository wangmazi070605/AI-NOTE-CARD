"use client";

import { useState } from "react";
import { generateCardContent } from "@/app/actions";
import type { Card } from "@/lib/schemas";

// 颜色主题样式映射
const colorThemeStyles = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-500",
    text: "text-blue-900 dark:text-blue-100",
    tagBg: "bg-blue-100 dark:bg-blue-900/40",
    tagText: "text-blue-700 dark:text-blue-300",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-950/20",
    border: "border-green-500",
    text: "text-green-900 dark:text-green-100",
    tagBg: "bg-green-100 dark:bg-green-900/40",
    tagText: "text-green-700 dark:text-green-300",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-500",
    text: "text-red-900 dark:text-red-100",
    tagBg: "bg-red-100 dark:bg-red-900/40",
    tagText: "text-red-700 dark:text-red-300",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-950/20",
    border: "border-purple-500",
    text: "text-purple-900 dark:text-purple-100",
    tagBg: "bg-purple-100 dark:bg-purple-900/40",
    tagText: "text-purple-700 dark:text-purple-300",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-500",
    text: "text-yellow-900 dark:text-yellow-100",
    tagBg: "bg-yellow-100 dark:bg-yellow-900/40",
    tagText: "text-yellow-700 dark:text-yellow-300",
  },
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [card, setCard] = useState<Card | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("请输入笔记内容");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const generatedCard = await generateCardContent(inputText);
      setCard(generatedCard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成卡片失败，请重试");
      console.error("生成卡片错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前卡片的样式
  const currentStyles = card
    ? colorThemeStyles[card.colorTheme]
    : {
        bg: "bg-white dark:bg-zinc-900",
        border: "border-zinc-300 dark:border-zinc-700",
        text: "text-zinc-900 dark:text-zinc-50",
        tagBg: "bg-zinc-100 dark:bg-zinc-800",
        tagText: "text-zinc-700 dark:text-zinc-300",
      };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-center text-black dark:text-zinc-50">
          AI 智能笔记卡片
        </h1>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 左侧：输入区域 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="note-input" 
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                输入笔记内容
              </label>
              <textarea
                id="note-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="在这里输入你的笔记内容..."
                className="min-h-[400px] w-full rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400"
            >
              {isLoading ? "正在思考..." : "生成卡片"}
            </button>
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* 右侧：卡片预览区域 */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              卡片预览
            </label>
            <div
              className={`flex-1 min-h-[500px] rounded-2xl border-2 ${currentStyles.border} ${currentStyles.bg} p-8 shadow-xl transition-all duration-300 ${
                card ? "scale-100" : "scale-95"
              }`}
              style={card ? { borderColor: card.borderColor } : undefined}
            >
              {card ? (
                <div className="flex h-full flex-col gap-6">
                  {/* 标题区域 */}
                  <div className="space-y-2">
                    <h2
                      className={`text-3xl font-bold leading-tight ${currentStyles.text}`}
                    >
                      {card.title}
                    </h2>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-1 w-12 rounded-full"
                        style={{ backgroundColor: card.borderColor }}
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {new Date().toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* 内容摘要区域 */}
                  <div className="flex-1">
                    <p
                      className={`text-base leading-7 ${currentStyles.text} whitespace-pre-wrap`}
                    >
                      {card.summary}
                    </p>
                  </div>

                  {/* 标签区域 */}
                  <div className="flex flex-wrap gap-2 border-t border-zinc-200/50 pt-4 dark:border-zinc-700/50">
                    {card.tags.map((tag, index) => (
                      <span
                        key={index}
                        className={`rounded-full ${currentStyles.tagBg} ${currentStyles.tagText} px-4 py-1.5 text-xs font-semibold shadow-sm`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                    <svg
                      className="h-8 w-8 text-zinc-400 dark:text-zinc-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    输入笔记内容并点击"生成卡片"按钮
                    <br />
                    即可查看精美的卡片预览
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
