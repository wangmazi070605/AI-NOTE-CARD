"use client";

import { useRef } from "react";
import Link from "next/link";
import html2canvas from "html2canvas";
import type { DailyFortune } from "@/lib/schemas";

interface DailyFortuneCardProps {
  data: DailyFortune;
}

/**
 * 将颜色值转换为 hex 格式
 * 处理各种颜色格式（hex, rgb, rgba, hsl, lab 等）并转换为 #RRGGBB
 */
function colorToHex(color: string): string {
  // 如果已经是 hex 格式，直接返回
  if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
    // 如果是 3 位 hex，转换为 6 位
    if (color.length === 4) {
      return `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
    }
    return color;
  }

  // 创建一个临时元素来解析颜色
  const tempDiv = document.createElement("div");
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);
  
  try {
    const computedColor = window.getComputedStyle(tempDiv).color;
    document.body.removeChild(tempDiv);
    
    // 解析 rgb/rgba 格式
    const rgbMatch = computedColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, "0");
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, "0");
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, "0");
      return `#${r}${g}${b}`;
    }
  } catch (e) {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }

  // 如果无法解析，返回默认黑色
  console.warn(`无法解析颜色 "${color}"，使用默认颜色 #000000`);
  return "#000000";
}

export default function DailyFortuneCard({ data }: DailyFortuneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // 渲染星星
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span
        key={i}
        className={`text-lg ${
          i < count ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
        }`}
      >
        ★
      </span>
    ));
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const element = cardRef.current;
      
      // 等待一下，确保所有内容渲染完成
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 动态导入 dom-to-image-more，确保只在客户端执行
      const domtoimage = (await import("dom-to-image-more")).default;
      
      // 使用 dom-to-image-more，这是一个更稳定可靠的库
      // 查找卡片元素（不包含下载按钮）
      let cardElement = element.querySelector<HTMLElement>('.relative.mx-auto.rounded-2xl');
      
      // 如果找不到，尝试查找第一个包含 rounded-2xl 的元素
      if (!cardElement) {
        cardElement = element.querySelector<HTMLElement>('.rounded-2xl');
      }
      
      // 如果还是找不到，使用整个元素（会在 filter 中排除按钮）
      if (!cardElement) {
        cardElement = element;
      }
      
      const dataUrl = await domtoimage.toPng(cardElement, {
        quality: 1.0,
        width: cardElement.offsetWidth,
        height: cardElement.scrollHeight || cardElement.offsetHeight,
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
        },
        filter: (node: Node) => {
          // 排除下载按钮
          if (node instanceof HTMLElement) {
            // 排除下载按钮
            const button = node.closest('button');
            if (button && (button.textContent?.includes('保存到手机') || button.textContent?.includes('📥'))) {
              return false;
            }
            // 如果 cardElement 是整个 element，排除包含按钮的容器
            if (cardElement === element && node.classList.contains('space-y-4') && node.querySelector('button')) {
              const buttons = node.querySelectorAll('button');
              for (const btn of buttons) {
                if (btn.textContent?.includes('保存到手机') || btn.textContent?.includes('📥')) {
                  // 只排除这个按钮容器，保留卡片
                  if (node === btn.parentElement?.parentElement) {
                    return false;
                  }
                }
              }
            }
          }
          return true;
        },
      });

      // 优先使用 Web Share API 保存到相册（移动端，特别是 iOS）
      // iOS Safari 支持通过 Web Share API 直接分享图片到相册
      if (navigator.share) {
        try {
          // 将 dataUrl 转换为 blob
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          
          const file = new File([blob], `今日运势-${data.date}.png`, {
            type: "image/png",
          });
          
          // iOS 可以直接分享文件，会弹出系统分享菜单，可以选择保存到相册
          try {
            await navigator.share({
              files: [file],
              title: `今日运势-${data.date}`,
              text: `我的今日运势`,
            });
            return; // 分享成功，直接返回
          } catch (shareError: any) {
            // 用户取消分享或其他错误，回退到下载
            if (shareError.name === "AbortError") {
              return; // 用户取消，直接返回
            }
            console.log("分享失败，使用下载方式:", shareError);
            // 继续执行下载逻辑
          }
        } catch (shareError) {
          console.error("分享失败:", shareError);
          // 继续执行下载逻辑
        }
      }
      
      // 回退到下载方式
      const link = document.createElement("a");
      link.download = `今日运势-${data.date}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("保存失败:", error);
      alert("保存失败，请重试");
    }
  };

  return (
    <div ref={cardRef} className="space-y-4">
      {/* 下载按钮 */}
      <div className="flex justify-center">
        <button
          onClick={handleDownload}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white font-bold text-sm hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 transition-all shadow-lg"
        >
          📥 保存到手机
        </button>
      </div>

      {/* 卡片容器 */}
      <div
        className="relative mx-auto rounded-2xl overflow-hidden shadow-2xl"
        style={{
          width: "375px",
          minHeight: "600px",
          background: `linear-gradient(135deg, ${data.themeColor}15 0%, ${data.luckyColorHex}10 50%, #1a1a1a 100%)`,
          border: `2px solid ${data.themeColor}40`,
        }}
      >
      {/* 背景装饰 */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${data.themeColor}40 0%, transparent 50%),
                       radial-gradient(circle at 70% 80%, ${data.luckyColorHex}40 0%, transparent 50%)`,
        }}
      />

      {/* 噪点纹理 */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* 内容 */}
      <div className="relative z-10 h-full p-6 flex flex-col">
        {/* 顶部：日期、星座和姓名 */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-3xl flex-shrink-0">{data.zodiacIcon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold truncate" style={{ color: data.themeColor }}>
                {data.zodiac}
              </div>
              <div className="text-xs opacity-60 truncate">{data.date}</div>
            </div>
          </div>
          {data.name && (
            <div className="text-right flex-shrink-0 ml-2">
              <div className="text-sm font-bold" style={{ color: data.themeColor }}>
                {data.name}
              </div>
            </div>
          )}
        </div>

        {/* 生辰八字 */}
        {data.bazi && (
          <div className="mb-4 p-3 rounded-lg bg-black/20 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold opacity-60 whitespace-nowrap">生辰八字：</span>
              <span className="text-sm font-bold flex-1 min-w-0 break-all" style={{ color: data.themeColor }}>
                {data.bazi}
              </span>
              <Link
                href="/daily-fortune/bazi-rule"
                target="_blank"
                className="w-5 h-5 flex-shrink-0 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-xs transition-colors text-white"
                title="查看规则详解"
              >
                ?
              </Link>
            </div>
          </div>
        )}

        {/* 视觉重心：巨大的运势分数 */}
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <div
              className="text-8xl font-black leading-none mb-2"
              style={{
                background: `linear-gradient(135deg, ${data.themeColor} 0%, ${data.luckyColorHex} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 20px rgba(0,0,0,0.3))",
              }}
            >
              {data.overallScore}
            </div>
            <div className="text-sm opacity-60">综合运势</div>
          </div>
        </div>

        {/* 关键词 */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {data.keywords.map((keyword, idx) => (
            <span
              key={idx}
              className="px-3 py-1 rounded-full text-xs font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${data.themeColor} 0%, ${data.luckyColorHex} 100%)`,
              }}
            >
              {keyword}
            </span>
          ))}
        </div>

        {/* 幸运物和幸运色 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">幸运物</div>
            <div className="text-sm font-bold">{data.luckyItem}</div>
          </div>
          <div className="w-px h-8 bg-gray-600" />
          <div className="text-center">
            <div className="text-xs opacity-60 mb-1">幸运色</div>
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full border-2 border-white"
                style={{ backgroundColor: data.luckyColorHex }}
              />
              <div className="text-sm font-bold">{data.luckyColor}</div>
            </div>
          </div>
        </div>

        {/* 模块化：爱情/事业/财运 */}
        <div className="space-y-4 mb-6">
          {/* 爱情 */}
          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">💕 爱情</span>
              <div className="flex gap-1">{renderStars(data.loveStars)}</div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{data.loveFortune}</p>
          </div>

          {/* 事业 */}
          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">💼 事业</span>
              <div className="flex gap-1">{renderStars(data.careerStars)}</div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{data.careerFortune}</p>
          </div>

          {/* 财运 */}
          <div className="bg-black/30 rounded-lg p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">💰 财运</span>
              <div className="flex gap-1">{renderStars(data.wealthStars)}</div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{data.wealthFortune}</p>
          </div>
        </div>

        {/* 星座和属相运势 */}
        <div className="space-y-2 mb-6">
          <div className="text-xs">
            <span className="font-bold opacity-60">星座运势：</span>
            <span className="text-gray-300">{data.zodiacFortune}</span>
          </div>
          <div className="text-xs">
            <span className="font-bold opacity-60">属相运势：</span>
            <span className="text-gray-300">{data.zodiacAnimalFortune}</span>
          </div>
        </div>

        {/* 底部：今日宜忌胶囊标签 */}
        <div className="mt-auto space-y-3">
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: data.themeColor }}>
              ✅ 今日宜
            </div>
            <div className="flex flex-wrap gap-2">
              {data.shouldDo.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold mb-2" style={{ color: data.themeColor }}>
              ❌ 今日忌
            </div>
            <div className="flex flex-wrap gap-2">
              {data.shouldNotDo.map((item, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

