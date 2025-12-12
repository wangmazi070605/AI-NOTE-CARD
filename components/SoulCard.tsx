"use client";

import { useRef } from "react";
import html2canvas from "html2canvas";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from "recharts";
import type { PersonalityCard } from "@/lib/schemas";

interface SoulCardProps {
  data: PersonalityCard;
}

const rarityColors: Record<string, string> = {
  N: "text-gray-400",
  R: "text-blue-400",
  SR: "text-purple-400",
  SSR: "text-yellow-400",
  UR: "text-red-400",
};

const rarityGradients: Record<string, string> = {
  N: "from-gray-400 to-gray-600",
  R: "from-blue-400 to-blue-600",
  SR: "from-purple-400 to-purple-600",
  SSR: "from-yellow-400 via-orange-400 to-yellow-600",
  UR: "from-red-400 via-pink-400 to-red-600",
};

export default function SoulCard({ data }: SoulCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // 3倍超采样，保证清晰度
        useCORS: true,
        backgroundColor: data.visual.bgColor,
        logging: false,
      });

      const link = document.createElement("a");
      link.download = `soul-card-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("下载失败:", error);
      alert("下载失败，请重试");
    }
  };

  // 雷达图数据
  const radarData = [
    {
      subject: "内向",
      value: data.stats.introversion,
    },
    {
      subject: "创造力",
      value: data.stats.creativity,
    },
    {
      subject: "幽默",
      value: data.stats.humor,
    },
    {
      subject: "逻辑",
      value: data.stats.logic,
    },
    {
      subject: "共情",
      value: data.stats.empathy,
    },
    {
      subject: "能量",
      value: data.stats.energy,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 卡片容器 */}
      <div
        ref={cardRef}
        className="relative mx-auto rounded-lg overflow-hidden shadow-2xl"
        style={{
          width: "375px",
          height: "500px",
          aspectRatio: "3/4",
          backgroundColor: data.visual.bgColor,
          color: data.visual.primaryColor,
        }}
      >
        {/* 噪点纹理背景 */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px 200px",
          }}
        />
        
        {/* 光效装饰 */}
        <div
          className="absolute top-0 left-0 w-full h-1 opacity-50"
          style={{
            background: `linear-gradient(90deg, transparent, ${data.visual.primaryColor}, transparent)`,
          }}
        />

        {/* 内容 */}
        <div className="relative z-10 h-full p-6 flex flex-col">
          {/* Header: 稀有度 */}
          <div className="flex justify-between items-start mb-4">
            <div className={`text-xs font-black tracking-wider ${rarityColors[data.rarity]}`}>
              RARITY: <span className={`bg-gradient-to-r ${rarityGradients[data.rarity]} bg-clip-text text-transparent font-black`}>{data.rarity}</span>
            </div>
            <div className="text-xs opacity-60 font-mono">SoulMirror AI</div>
          </div>

          {/* Title */}
          <h2
            className="text-3xl font-black text-center mb-6 leading-tight drop-shadow-lg"
            style={{ 
              color: data.visual.primaryColor,
              textShadow: `0 0 10px ${data.visual.primaryColor}40`,
            }}
          >
            {data.title}
          </h2>

          {/* 雷达图 */}
          <div className="flex-1 mb-4" style={{ height: "180px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke={data.visual.secondaryColor} strokeOpacity={0.3} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: data.visual.primaryColor, fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: data.visual.secondaryColor, fontSize: 8 }}
                />
                <Radar
                  name="人格"
                  dataKey="value"
                  stroke={data.visual.primaryColor}
                  fill={data.visual.primaryColor}
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* 毒舌判词 */}
          <div
            className="text-sm leading-relaxed mb-4 px-2"
            style={{ color: data.visual.primaryColor }}
          >
            {data.analysis.comment}
          </div>

          {/* 爱好和合拍 */}
          <div className="space-y-2 text-xs">
            <div>
              <span className="opacity-60">可能的爱好：</span>
              <span style={{ color: data.visual.secondaryColor }}>
                {data.analysis.hobbies.join("、")}
              </span>
            </div>
            <div>
              <span className="opacity-60">和</span>
              <span style={{ color: data.visual.secondaryColor }}>
                {data.analysis.compatible}
              </span>
              <span className="opacity-60">的人比较合</span>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t" style={{ borderColor: `${data.visual.primaryColor}30` }}>
            <div className="text-xs opacity-60 mb-2 text-center font-mono">SoulMirror AI 认证</div>
            <div 
              className="w-16 h-16 mx-auto border flex items-center justify-center text-xs opacity-40"
              style={{
                backgroundColor: `${data.visual.secondaryColor}20`,
                borderColor: `${data.visual.primaryColor}40`,
              }}
            >
              QR
            </div>
          </div>
        </div>
      </div>

      {/* 下载按钮 */}
      <button
        onClick={handleDownload}
        className="w-full px-6 py-4 bg-gradient-to-r from-green-400/20 to-cyan-400/20 border-2 border-green-400 text-green-400 font-bold text-lg hover:from-green-400/30 hover:to-cyan-400/30 transition-all"
      >
        保存到相册
      </button>
    </div>
  );
}

