"use server";

import { personalityCardSchema, type PersonalityCard } from "@/lib/schemas";

export type ChatMode = "tieba" | "tea" | "savage" | "cute";

/**
 * 生成人格卡片的 Server Action
 * @param conversations 5轮对话记录 [{role: "user" | "assistant", content: string}]
 * @param chatMode 聊天模式
 * @returns 生成的人格卡片
 */
export async function generatePersonalityCard(
  conversations: Array<{ role: "user" | "assistant"; content: string }>,
  chatMode: ChatMode = "tieba"
): Promise<PersonalityCard> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  // 构建对话历史
  const conversationHistory = conversations
    .map((conv) => `${conv.role === "user" ? "用户" : "AI"}: ${conv.content}`)
    .join("\n");

  // 根据聊天模式设置系统提示词
  const modePrompts = {
    tieba: "你是一个百度贴吧资深老哥，说话风格：直接、幽默、带点网络梗、偶尔毒舌但有趣。",
    tea: "你是一个茶里茶气的AI，说话风格：阴阳怪气、暗戳戳、表面温柔实际带刺。",
    savage: "你是一个毒舌AI，说话风格：犀利、一针见血、不留情面但有趣。",
    cute: "你是一个可爱AI，说话风格：软萌、撒娇、用emoji、温柔治愈。",
  };

  try {
    console.log("=== 生成人格卡片 ===");
    console.log("聊天模式:", chatMode);
    console.log("对话轮数:", conversations.length);

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
              content: `${modePrompts[chatMode]}

根据以下5轮对话，分析用户的人格特征，生成一张人格卡片。要求：
1. 文案必须犀利、幽默、有网感，严禁使用教科书式的心理学术语
2. 根据对话内容随机确定最突出的人格特征
3. 每个人都要不一样，不要模板化`,
            },
            {
              role: "user",
              content: `请根据以下对话记录，生成人格卡片数据（必须是有效的 JSON，不要包含任何其他文字）：

对话记录：
${conversationHistory}

请按照以下 JSON 格式输出：

{
  "title": "人格标题（有趣、有网感，如'社恐但话痨'、'表面佛系内心卷王'）",
  "rarity": "N|R|SR|SSR|UR（根据人格稀有度）",
  "analysis": {
    "comment": "毒舌判词（200-300字，犀利幽默，有网感）",
    "hobbies": ["可能的爱好1", "可能的爱好2", "可能的爱好3"],
    "compatible": "和什么人格的人比较合（如'同样社恐的'、'能接住你梗的'）"
  },
  "stats": {
    "introversion": 0-100（内向程度）,
    "creativity": 0-100（创造力）,
    "humor": 0-100（幽默感）,
    "logic": 0-100（逻辑性）,
    "empathy": 0-100（共情力）,
    "energy": 0-100（能量值）
  },
  "visual": {
    "bgColor": "#颜色值（根据人格选择背景色）",
    "primaryColor": "#颜色值（主色调）",
    "secondaryColor": "#颜色值（辅助色）"
  }
}

要求：
1. 标题要有趣、有网感，不要用"内向型"、"外向型"这种术语
2. 判词要犀利幽默，可以带网络梗
3. 稀有度根据人格的独特程度判断
4. 数据要真实反映对话中表现出的人格
5. 颜色要根据人格特征选择（如社恐用冷色，活泼用暖色）

只返回 JSON，不要包含任何其他文字。`,
            },
          ],
          temperature: 0.9, // 提高温度以获得更多样化的结果
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
      const validated = personalityCardSchema.parse(parsed);

      console.log("人格卡片生成成功");
      return validated;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        throw new Error("请求超时：DeepSeek API 响应时间超过 30 秒");
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("生成人格卡片错误:", error);

    const errorMessage = error?.message || "";

    if (errorMessage.includes("Insufficient Balance") || errorMessage.includes("余额不足")) {
      throw new Error("账户余额不足！请访问 https://platform.deepseek.com/ 充值");
    }

    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
      throw new Error(`数据解析失败: ${errorMessage}。请重试。`);
    }

    throw new Error(`生成人格卡片失败: ${errorMessage || "未知错误"}`);
  }
}

