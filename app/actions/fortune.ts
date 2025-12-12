"use server";

import { fortuneCardSchema, type FortuneCard } from "@/lib/schemas";
import type { Diagnosis } from "@/lib/schemas";

/**
 * 生成情感分析卡片的 Server Action
 * @param diagnosis 情绪诊断结果
 * @returns 生成的情感分析卡片
 */
export async function generateFortuneCard(
  diagnosis: Diagnosis
): Promise<FortuneCard> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  const today = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  try {
    console.log("=== 生成情感分析卡片 ===");
    console.log("日期:", today);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "你是一个专业的情感分析师，擅长根据情绪状态提供建议和洞察。你的风格是专业、温暖、有建设性，能够帮助用户更好地理解自己的情感状态。",
            },
            {
              role: "user",
              content: `根据以下情绪诊断结果，生成一张情感分析卡片（必须是有效的 JSON，不要包含任何其他文字）：

情绪诊断：
- 情绪类型：${diagnosis.emotionType}
- 标题：${diagnosis.title}
- 分析：${diagnosis.analysis}
- 情绪强度：${diagnosis.intensity}%

请按照以下 JSON 格式输出：

{
  "date": "${today}",
  "title": "情感分析卡片标题（一句话，温暖有洞察）",
  "emotionType": "${diagnosis.emotionType}",
  "analysis": "${diagnosis.analysis}",
  "fortune": {
    "overall": "整体运势（50-100字，神秘有趣）",
    "love": "感情运势（50-100字）",
    "career": "事业运势（50-100字）",
    "health": "健康运势（50-100字）"
  },
  "tags": ${JSON.stringify(diagnosis.tags)},
  "emotionColor": "${diagnosis.emotionColor}",
  "suggestions": ${JSON.stringify(diagnosis.suggestions)},
  "intensity": ${diagnosis.intensity}
}

要求：
1. 运势分析要结合情绪状态，神秘有趣，有建设性
2. 不要用过于迷信的语言，要有现代感
3. 整体运势要概括，其他三项要具体

只返回 JSON，不要包含任何其他文字。`,
            },
          ],
          temperature: 0.8,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData?.error?.message || response.statusText;
        console.error("DeepSeek API 错误响应:", {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
        });
        throw new Error(
          `DeepSeek API 请求失败 (${response.status}): ${errorMessage}`
        );
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("DeepSeek API 返回的数据格式不正确");
      }

      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const parsed = JSON.parse(jsonText);
      const validated = fortuneCardSchema.parse(parsed);

      console.log("情感分析卡片生成成功");
      return validated;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        throw new Error("请求超时：DeepSeek API 响应时间超过 30 秒");
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("生成情感分析卡片错误:", error);

    const errorMessage = error?.message || "";

    if (errorMessage.includes("Insufficient Balance") || errorMessage.includes("余额不足")) {
      throw new Error("账户余额不足！请访问 https://platform.deepseek.com/ 充值");
    }

    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
      throw new Error(`数据解析失败: ${errorMessage}。请重试。`);
    }

    throw new Error(`生成情感分析卡片失败: ${errorMessage || "未知错误"}`);
  }
}

