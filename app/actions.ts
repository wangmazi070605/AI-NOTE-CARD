"use server";

import { cardSchema, type Card } from "@/lib/schemas";

// 直接使用 fetch 调用 DeepSeek API，避免 AI SDK 使用不支持的 /responses 端点
// 根据 DeepSeek 文档：https://api-docs.deepseek.com/zh-cn/
// 正确的端点是 https://api.deepseek.com/v1/chat/completions

/**
 * 生成卡片内容的 Server Action
 * @param inputText 用户输入的笔记内容
 * @returns 生成的卡片对象
 */
export async function generateCardContent(
  inputText: string
): Promise<Card> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  // 验证 API Key 格式（DeepSeek API Key 通常以 sk- 开头）
  if (!apiKey.startsWith("sk-")) {
    console.warn("API Key 格式可能不正确，DeepSeek API Key 通常以 'sk-' 开头");
  }

  try {
    console.log("=== DeepSeek API 调用信息 ===");
    console.log("请求地址:", "https://api.deepseek.com/v1/chat/completions");
    console.log("模型:", "deepseek-chat");
    console.log("API Key 前6位:", apiKey.substring(0, 6) + "...");
    console.log("API Key 长度:", apiKey.length);
    console.log("API Key 格式:", apiKey.startsWith("sk-") ? "正确" : "可能不正确");

    // 直接使用 fetch 调用 DeepSeek API
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
            content: "你是一个笔记整理专家，请分析用户的输入，提取关键信息并按照 JSON 格式输出。",
          },
          {
            role: "user",
            content: `请分析以下笔记内容，并按照以下 JSON 格式输出（必须是有效的 JSON，不要包含任何其他文字）：

{
  "title": "精炼的标题",
  "summary": "内容摘要",
  "tags": ["标签1", "标签2", "标签3"],
  "colorTheme": "blue|green|red|purple|yellow",
  "borderColor": "#颜色值"
}

用户输入：
${inputText}

请根据输入内容：
1. 生成一个精炼的标题（title）
2. 生成内容摘要（summary）
3. 提取3个相关标签（tags）
4. 根据内容情绪选择颜色主题（colorTheme）：blue（平静/专业）、green（积极/成长）、red（重要/紧急）、purple（创意/灵感）、yellow（提醒/注意）
5. 生成对应的 hex 颜色值（borderColor）

只返回 JSON，不要包含任何其他文字。`,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API 错误响应:", {
        status: response.status,
        statusText: response.statusText,
        data: errorData,
      });
      throw new Error(
        `DeepSeek API 请求失败: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("DeepSeek API 调用成功，响应数据:", JSON.stringify(data, null, 2));

    // 提取响应文本
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("DeepSeek API 返回的数据格式不正确");
    }

    console.log("原始响应文本:", text);

    // 尝试提取 JSON（可能包含 markdown 代码块）
    let jsonText = text.trim();
    
    // 移除可能的 markdown 代码块标记
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    // 解析 JSON
    const parsed = JSON.parse(jsonText);
    
    // 使用 Zod Schema 验证
    const validated = cardSchema.parse(parsed);
    
    console.log("JSON 解析和验证成功");
    return validated;
  } catch (error: any) {
    // 记录完整的错误信息
    const errorDetails = {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      statusText: error?.statusText,
      cause: error?.cause,
      name: error?.name,
      url: error?.url, // 实际请求的 URL
      response: error?.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: error.response.url,
      } : null,
      // 尝试获取更多错误信息
      stack: error?.stack,
    };
    
    console.error("DeepSeek API 错误详情:", JSON.stringify(errorDetails, null, 2));
    
    // 尝试从 cause 中获取更多信息
    if (error?.cause) {
      console.error("错误原因 (cause):", JSON.stringify(error.cause, null, 2));
    }
    
    // 检查余额不足错误
    const errorMessage = error?.message || "";
    const errorResponse = error?.response?.data || error?.cause;
    
    if (
      errorMessage.includes("Insufficient Balance") ||
      errorMessage.includes("余额不足") ||
      errorMessage.includes("insufficient") ||
      (errorResponse && JSON.stringify(errorResponse).includes("Insufficient Balance"))
    ) {
      throw new Error(
        "账户余额不足！\n\n" +
        "请访问 https://platform.deepseek.com/ 充值账户余额。\n" +
        "DeepSeek API 需要账户有足够的余额才能使用。"
      );
    }
    
    // 根据不同的错误类型提供更具体的错误信息
    if (error?.status === 404 || error?.statusCode === 404 || errorMessage.includes("Not Found")) {
      throw new Error(
        "API 端点未找到 (404)。可能的原因：\n" +
        "1. API Key 无效或已过期 - 请访问 https://platform.deepseek.com/api_keys 检查\n" +
        "2. API Key 没有权限访问该模型\n" +
        "3. 账户余额不足\n" +
        "4. 模型名称 'deepseek-chat' 不正确\n" +
        `\n错误详情: ${errorMessage || "未知"}`
      );
    }
    
    if (error?.status === 401 || error?.statusCode === 401) {
      throw new Error("API Key 认证失败 (401)。请检查 API Key 是否正确。");
    }
    
    if (error?.status === 429 || error?.statusCode === 429) {
      throw new Error("请求频率过高 (429)。请稍后再试。");
    }
    
    throw new Error(`AI 生成失败: ${errorMessage || "未知错误"}`);
  }
}

