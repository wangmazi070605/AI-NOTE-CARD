"use client";

import { useState } from "react";
import { generatePersonalityCard, type ChatMode } from "@/app/actions/personality";
import type { PersonalityCard } from "@/lib/schemas";
import SoulCard from "@/components/SoulCard";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const chatModes: { value: ChatMode; label: string; emoji: string; desc: string }[] = [
  { value: "tieba", label: "贴吧老哥", emoji: "🔥", desc: "直接、幽默、带梗" },
  { value: "tea", label: "茶里茶气", emoji: "🍵", desc: "阴阳怪气、暗戳戳" },
  { value: "savage", label: "毒舌模式", emoji: "😈", desc: "犀利、一针见血" },
  { value: "cute", label: "可爱模式", emoji: "😊", desc: "软萌、温柔治愈" },
];

export default function PersonalityPage() {
  const [chatMode, setChatMode] = useState<ChatMode>("tieba");
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [card, setCard] = useState<PersonalityCard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!userInput.trim() || messages.length >= 10) return;

    const userMessage: Message = { role: "user", content: userInput.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setUserInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mode: chatMode,
        }),
      });

      if (!response.ok) {
        throw new Error("AI 回复生成失败");
      }

      const data = await response.json();
      const assistantMessage: Message = { role: "assistant", content: data.reply };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      if (updatedMessages.length >= 10) {
        await generateCard(updatedMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送消息失败");
      setIsLoading(false);
    }
  };

  const generateCard = async (conversations: Message[]) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePersonalityCard(conversations, chatMode);
      setCard(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成卡片失败");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (messages.length < 2) {
      setError("至少需要1轮对话才能生成报告");
      return;
    }
    await generateCard(messages);
  };

  const resetChat = () => {
    setMessages([]);
    setCard(null);
    setError(null);
    setUserInput("");
  };

  const conversationCount = Math.floor(messages.length / 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 科技感背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* 网格背景 */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
        
        {/* 光效 */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* 扫描线效果 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent animate-pulse" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-2xl">
              🧬
            </div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              AI 人格测试系统
            </h1>
          </div>
          <p className="text-slate-300 text-lg">
            通过 5 轮深度对话，AI 将为你生成专属人格分析报告
          </p>
        </div>

        {card ? (
          /* 卡片展示页面 */
          <div className="max-w-md mx-auto">
            <div className="mb-6 text-center">
              <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30 text-purple-300 text-sm font-medium">
                ✨ 检测完成
              </div>
            </div>
            <SoulCard data={card} />
            <button
              onClick={resetChat}
              className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all shadow-lg shadow-purple-500/50"
            >
              重新检测
            </button>
          </div>
        ) : (
          /* 聊天界面 */
          <div className="max-w-4xl mx-auto">
            {/* 聊天模式选择 */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
                选择 AI 对话风格
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {chatModes.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => {
                      if (messages.length === 0) setChatMode(mode.value);
                    }}
                    disabled={messages.length > 0}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      chatMode === mode.value
                        ? "border-purple-400 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 shadow-lg shadow-purple-500/50"
                        : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-3xl mb-2">{mode.emoji}</div>
                    <div className={`text-sm font-bold mb-1 ${
                      chatMode === mode.value ? "text-white" : "text-slate-300"
                    }`}>
                      {mode.label}
                    </div>
                    <div className="text-xs text-slate-400">{mode.desc}</div>
                    {chatMode === mode.value && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 进度指示器 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-300">对话进度</span>
                <span className="text-sm font-bold text-purple-400">
                  {conversationCount}/5 轮
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 rounded-full"
                  style={{ width: `${(conversationCount / 5) * 100}%` }}
                />
              </div>
            </div>

            {/* 聊天消息区域 */}
            <div className="mb-6 h-[450px] overflow-y-auto rounded-xl border border-slate-700 bg-slate-900/50 backdrop-blur-sm p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-cyan-500/20 flex items-center justify-center text-4xl mb-4 border border-purple-400/30">
                    🤖
                  </div>
                  <p className="text-slate-400 text-lg mb-2">开始你的人格测试之旅</p>
                  <p className="text-slate-500 text-sm">与 AI 进行 5 轮对话，生成专属人格卡片</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-4 ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                          : "bg-slate-800 border border-slate-700 text-slate-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {msg.role === "assistant" && (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-xs flex-shrink-0">
                            AI
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-slate-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-300" />
                      <span className="ml-2 text-sm">AI 正在分析...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 输入区域 */}
            {messages.length < 10 ? (
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                  placeholder="输入你的消息..."
                  className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !userInput.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/50"
                >
                  发送
                </button>
              </div>
            ) : (
              <button
                onClick={handleGenerateReport}
                disabled={isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 transition-all shadow-lg shadow-purple-500/50 disabled:opacity-50 animate-pulse"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    正在生成人格卡片...
                  </span>
                ) : (
                  "✨ 生成成分查询报告"
                )}
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 自定义动画 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .delay-150 {
          animation-delay: 150ms;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
