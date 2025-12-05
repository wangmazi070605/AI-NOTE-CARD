"use server";

import { generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { cardSchema, type Card } from "@/lib/schemas";

// 创建 OpenAI 兼容的客户端实例（配置为 DeepSeek API）
const openai = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: "https://api.deepseek.com",
});

/**
 * 生成卡片内容的 Server Action
 * @param inputText 用户输入的笔记内容
 * @returns 生成的卡片对象
 */
export async function generateCardContent(
  inputText: string
): Promise<Card> {
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  const { object } = await generateObject({
    model: openai("deepseek-chat"),
    schema: cardSchema,
    prompt: `你是一个笔记整理专家，请分析用户的输入，提取关键信息并按照 Schema 格式输出 JSON。

用户输入：
${inputText}

请根据输入内容：
1. 生成一个精炼的标题（title）
2. 生成内容摘要（summary）
3. 提取3个相关标签（tags）
4. 根据内容情绪选择颜色主题（colorTheme）：blue（平静/专业）、green（积极/成长）、red（重要/紧急）、purple（创意/灵感）、yellow（提醒/注意）
5. 生成对应的 hex 颜色值（borderColor）`,
  });

  return object;
}

