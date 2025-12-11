"use client";

import { useState, useEffect } from "react";
import { generateDiagnosis, type AnalysisMode } from "@/app/actions";
import type { Diagnosis } from "@/lib/schemas";

// 情绪类型对应的UI效果配置
const emotionEffects = {
  anxiety: {
    bg: "bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900",
    pattern: "anxiety-pattern",
    animation: "animate-pulse",
  },
  lovebrain: {
    bg: "bg-gradient-to-br from-pink-50 via-rose-50 to-fuchsia-50 dark:from-pink-950/20 dark:via-rose-950/20 dark:to-fuchsia-950/20",
    pattern: "bubbles",
    animation: "animate-bounce-slow",
  },
  emo: {
    bg: "bg-gradient-to-br from-slate-800 via-slate-900 to-black dark:from-black dark:via-slate-950 dark:to-slate-900",
    pattern: "rain",
    animation: "",
  },
  happy: {
    bg: "bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950/20 dark:via-amber-950/20 dark:to-orange-950/20",
    pattern: "stars",
    animation: "animate-spin-slow",
  },
  confused: {
    bg: "bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 dark:from-purple-950/20 dark:via-violet-950/20 dark:to-indigo-950/20",
    pattern: "blur",
    animation: "animate-blur",
  },
  angry: {
    bg: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50 dark:from-red-950/20 dark:via-rose-950/20 dark:to-pink-950/20",
    pattern: "fire",
    animation: "animate-pulse",
  },
  sad: {
    bg: "bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 dark:from-blue-950/20 dark:via-cyan-950/20 dark:to-sky-950/20",
    pattern: "clouds",
    animation: "",
  },
  excited: {
    bg: "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20",
    pattern: "sparkles",
    animation: "animate-pulse",
  },
};

// 情绪类型中文映射
const emotionLabels: Record<string, string> = {
  anxiety: "焦虑",
  lovebrain: "恋爱脑",
  emo: "emo",
  happy: "开心",
  confused: "迷茫",
  angry: "愤怒",
  sad: "悲伤",
  excited: "兴奋",
};

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<AnalysisMode>("savage");
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      setError("请输入你的碎碎念或聊天记录");
      return;
    }

    setIsLoading(true);
    setError(null);
    setDiagnosis(null);

    try {
      const result = await generateDiagnosis(inputText, mode);
      setDiagnosis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "心理分析失败，请重试");
      console.error("心理分析错误:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前情绪效果
  const currentEffect = diagnosis
    ? emotionEffects[diagnosis.emotionType]
    : emotionEffects.happy;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black transition-all duration-500">
      {/* 动态背景效果 */}
      <div className={`fixed inset-0 ${currentEffect.bg} transition-all duration-1000 -z-10`}>
        {diagnosis && (
          <>
            {/* 焦虑：混乱线条 */}
            {diagnosis.emotionType === "anxiety" && (
              <div className="absolute inset-0 opacity-20">
                <svg className="w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <line
                      key={i}
                      x1={Math.random() * 100 + "%"}
                      y1={Math.random() * 100 + "%"}
                      x2={Math.random() * 100 + "%"}
                      y2={Math.random() * 100 + "%"}
                      stroke="currentColor"
                      strokeWidth="1"
                      className="text-slate-400"
                    />
                  ))}
                </svg>
              </div>
            )}
            {/* 恋爱脑：粉色泡泡 */}
            {diagnosis.emotionType === "lovebrain" && (
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-pink-300/30 dark:bg-pink-500/20 animate-float"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${20 + Math.random() * 40}px`,
                      height: `${20 + Math.random() * 40}px`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${3 + Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {/* emo：雨滴 */}
            {diagnosis.emotionType === "emo" && (
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-8 bg-slate-400/30 animate-rain"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: "-10%",
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random()}s`,
                    }}
                  />
                ))}
              </div>
            )}
            {/* 开心：星星 */}
            {diagnosis.emotionType === "happy" && (
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute text-yellow-300/40 animate-twinkle"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      fontSize: `${10 + Math.random() * 20}px`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  >
                    ✨
                  </div>
                ))}
              </div>
            )}
            {/* 兴奋：闪光 */}
            {diagnosis.emotionType === "excited" && (
              <div className="absolute inset-0 overflow-hidden">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400/40 rounded-full animate-ping"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* 标题和模式切换 */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-5xl font-bold text-black dark:text-zinc-50">
            🔮 赛博算命大师
          </h1>
          <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-400">
            AI 心理镜像 · 看见真实的自己
          </p>
          
          {/* 模式切换 */}
          <div className="inline-flex rounded-lg border border-zinc-300 bg-white p-1 dark:border-zinc-700 dark:bg-zinc-900">
            <button
              onClick={() => setMode("healing")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "healing"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              😇 治愈模式
            </button>
            <button
              onClick={() => setMode("savage")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                mode === "savage"
                  ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              }`}
            >
              😈 毒舌模式
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左侧：输入区域 */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="input-text"
                className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                输入你的碎碎念或聊天记录
              </label>
              <textarea
                id="input-text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="粘贴一段最近的聊天记录、碎碎念，或者任何你想被分析的文字..."
                className="min-h-[400px] w-full rounded-lg border border-zinc-300 bg-white/80 backdrop-blur-sm p-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus:ring-zinc-400"
            >
              {isLoading ? "🔮 正在占卜..." : "🔮 开始占卜"}
            </button>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* 右侧：诊断结果区域 */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              灵魂诊断书
            </label>
            <div
              className={`relative flex-1 min-h-[500px] rounded-2xl border-2 overflow-hidden transition-all duration-500 ${
                diagnosis ? "scale-100 opacity-100" : "scale-95 opacity-50"
              }`}
              style={
                diagnosis
                  ? {
                      borderColor: diagnosis.emotionColor,
                      boxShadow: `0 20px 60px -10px ${diagnosis.emotionColor}40`,
                    }
                  : {
                      borderColor: "#e5e7eb",
                    }
              }
            >
              {/* 背景层 - 确保文字清晰 */}
              <div className="absolute inset-0 bg-white dark:bg-zinc-900" />
              <div 
                className="absolute inset-0 opacity-5"
                style={diagnosis ? { backgroundColor: diagnosis.emotionColor } : {}}
              />
              
              {/* 内容层 */}
              <div className="relative z-10 h-full p-8 flex flex-col">
                {isLoading ? (
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <div className="relative">
                      <div className="h-16 w-16 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400"></div>
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        🔮
                      </div>
                    </div>
                    <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                      AI 正在深度分析你的内心...
                    </p>
                  </div>
                ) : diagnosis ? (
                  <div className="flex h-full flex-col gap-6">
                    {/* 情绪标签和强度 */}
                    <div className="flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="rounded-full px-4 py-1.5 text-sm font-bold text-white shadow-md"
                          style={{ backgroundColor: diagnosis.emotionColor }}
                        >
                          {emotionLabels[diagnosis.emotionType]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                            强度
                          </span>
                          <div className="h-2 w-20 bg-zinc-200 rounded-full overflow-hidden dark:bg-zinc-700">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${diagnosis.intensity}%`,
                                backgroundColor: diagnosis.emotionColor,
                              }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 min-w-[35px]">
                            {diagnosis.intensity}%
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        {new Date().toLocaleDateString("zh-CN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    {/* 诊断标题 */}
                    <div className="flex-shrink-0">
                      <h2 className="text-3xl font-bold leading-tight text-zinc-900 dark:text-zinc-50 mb-3">
                        {diagnosis.title}
                      </h2>
                      <div
                        className="h-1.5 w-20 rounded-full"
                        style={{ backgroundColor: diagnosis.emotionColor }}
                      />
                    </div>

                    {/* 详细分析 */}
                    <div className="flex-1 overflow-y-auto min-h-0">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <p className="text-base leading-8 font-medium text-zinc-800 whitespace-pre-wrap dark:text-zinc-100">
                          {diagnosis.analysis}
                        </p>
                      </div>
                    </div>

                    {/* 情绪标签 */}
                    <div className="flex flex-wrap gap-2 border-t-2 border-zinc-200 pt-4 flex-shrink-0 dark:border-zinc-700">
                      {diagnosis.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-zinc-100 px-4 py-1.5 text-xs font-semibold text-zinc-700 shadow-sm dark:bg-zinc-800 dark:text-zinc-200"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* 建议 */}
                    <div className="rounded-xl border-2 bg-gradient-to-br from-zinc-50 to-zinc-100 p-5 flex-shrink-0 dark:from-zinc-800 dark:to-zinc-900 dark:border-zinc-700">
                      <h3 className="mb-3 text-sm font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        <span>建议</span>
                      </h3>
                      <ul className="space-y-2.5">
                        {diagnosis.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <span className="mt-1 text-zinc-400 dark:text-zinc-500 font-bold">•</span>
                            <span className="text-sm leading-6 font-medium text-zinc-700 dark:text-zinc-200">
                              {suggestion}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                    <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
                      <span className="text-4xl">🔮</span>
                    </div>
                    <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                      输入你的碎碎念或聊天记录
                      <br />
                      让 AI 为你解读内心世界
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 自定义动画样式 */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }
        @keyframes rain {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh);
            opacity: 0;
          }
        }
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-rain {
          animation: rain 1s linear infinite;
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

