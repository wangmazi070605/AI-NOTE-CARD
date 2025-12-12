"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import type { FortuneCard } from "@/lib/schemas";

interface FortuneCardProps {
  data: FortuneCard;
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

export default function FortuneCard({ data }: FortuneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      // 确保背景颜色是 hex 格式，避免 html2canvas 解析 LAB 颜色错误
      const bgColor = colorToHex(data.emotionColor);
      
      const element = cardRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: bgColor,
        logging: false,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth || element.offsetWidth,
        windowHeight: element.scrollHeight || element.offsetHeight,
        allowTaint: false,
        onclone: (clonedDoc, clonedElement) => {
          // 确保克隆的元素有正确的高度，移除固定高度限制
          const clonedEl = clonedElement as HTMLElement;
          if (clonedEl) {
            clonedEl.style.height = "auto";
            clonedEl.style.minHeight = "600px";
            clonedEl.style.overflow = "visible";
          }
          
          // 确保内部容器也能正确显示完整内容
          const innerContainer = clonedEl?.querySelector<HTMLElement>(".relative.z-10");
          if (innerContainer) {
            innerContainer.style.height = "auto";
            innerContainer.style.minHeight = "100%";
            innerContainer.style.overflow = "visible";
          }
          
          // 在克隆的文档中，将所有可能包含 LAB/LCH 的颜色替换为 hex 格式
          const allElements = clonedDoc.querySelectorAll<HTMLElement>("[style]");
          
          allElements.forEach((el) => {
            const style = el.getAttribute("style") || "";
            // 如果样式包含 emotionColor，替换为 hex 格式
            if (style.includes(data.emotionColor)) {
              const newStyle = style.replace(new RegExp(data.emotionColor, "g"), bgColor);
              el.setAttribute("style", newStyle);
            }
          });
          
          // 检查 computed style 中是否有 LAB/LCH 颜色
          const window = clonedDoc.defaultView;
          if (!window) return;
          
          const allComputed = clonedDoc.querySelectorAll<HTMLElement>("*");
          allComputed.forEach((el) => {
            try {
              const computed = window.getComputedStyle(el);
              const color = computed.color;
              const bgColorComputed = computed.backgroundColor;
              const borderColor = computed.borderColor;
              
              // 如果检测到 LAB/LCH 颜色，使用 hex 版本替换
              if (color && (color.toLowerCase().includes("lab(") || color.toLowerCase().includes("lch("))) {
                el.style.color = bgColor;
              }
              if (bgColorComputed && (bgColorComputed.toLowerCase().includes("lab(") || bgColorComputed.toLowerCase().includes("lch("))) {
                el.style.backgroundColor = bgColor;
              }
              if (borderColor && (borderColor.toLowerCase().includes("lab(") || borderColor.toLowerCase().includes("lch("))) {
                el.style.borderColor = bgColor;
              }
            } catch (e) {
              // 忽略错误
            }
          });
        },
      });

      const link = document.createElement("a");
      link.download = `fortune-card-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败，请重试");
    }
  };

  return (
    <div className="space-y-6">
      {/* 卡片容器 */}
      <div
        ref={cardRef}
        className="relative mx-auto rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: "375px",
          minHeight: "600px",
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
        }}
      >
        {/* 背景渐变 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, ${data.emotionColor}20 0%, #1a1a1a 100%)`,
          }}
        />

        {/* 噪点纹理 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />

        {/* 内容 */}
        <div className="relative z-10 h-full p-6 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs font-bold text-yellow-400">
              💭 情感分析卡片
            </div>
            <div className="text-xs opacity-60">{data.date}</div>
          </div>

          {/* 标题 */}
          <h2
            className="text-2xl font-black text-center mb-2 leading-tight"
            style={{ color: data.emotionColor }}
          >
            {data.title}
          </h2>

          {/* 情绪标签 */}
          <div className="flex justify-center mb-4">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: data.emotionColor }}
            >
              {emotionLabels[data.emotionType]}
            </span>
          </div>

          {/* 分析内容 */}
          <div className="flex-1 mb-4 px-2">
            <p className="text-sm leading-relaxed text-gray-300 mb-4">
              {data.analysis}
            </p>

            {/* 运势分析 */}
            <div className="space-y-3">
              <div className="border-l-2 pl-3" style={{ borderColor: data.emotionColor }}>
                <div className="text-xs font-bold mb-1" style={{ color: data.emotionColor }}>
                  整体运势
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{data.fortune.overall}</p>
              </div>

              <div className="border-l-2 pl-3" style={{ borderColor: data.emotionColor }}>
                <div className="text-xs font-bold mb-1" style={{ color: data.emotionColor }}>
                  感情运势
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{data.fortune.love}</p>
              </div>

              <div className="border-l-2 pl-3" style={{ borderColor: data.emotionColor }}>
                <div className="text-xs font-bold mb-1" style={{ color: data.emotionColor }}>
                  事业运势
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{data.fortune.career}</p>
              </div>

              <div className="border-l-2 pl-3" style={{ borderColor: data.emotionColor }}>
                <div className="text-xs font-bold mb-1" style={{ color: data.emotionColor }}>
                  健康运势
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{data.fortune.health}</p>
              </div>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center">
            {data.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* 建议 */}
          <div className="mb-4 px-2">
            <div className="text-xs font-bold mb-2" style={{ color: data.emotionColor }}>
              建议
            </div>
            <ul className="space-y-1">
              {data.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-xs text-gray-400 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Footer - 署名 */}
          <div className="mt-auto pt-4 border-t border-gray-700 text-center">
            <div className="text-xs opacity-60 mb-1">情感分析师：AI</div>
            <div className="text-xs opacity-40">SoulMirror AI 认证</div>
          </div>
        </div>
      </div>

      {/* 下载按钮 */}
      <button
        onClick={handleDownload}
        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
      >
        保存到相册
      </button>
    </div>
  );
}

