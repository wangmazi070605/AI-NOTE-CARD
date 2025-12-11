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
    // 添加超时处理（30秒）
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
      console.log("DeepSeek API 调用成功，响应数据:", JSON.stringify(data, null, 2));

      // 提取响应文本
      const text = data.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error("DeepSeek API 返回的数据格式不正确：缺少 choices[0].message.content");
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
      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (parseError) {
        console.error("JSON 解析失败:", parseError);
        console.error("尝试解析的文本:", jsonText);
        throw new Error(`JSON 解析失败: ${parseError instanceof Error ? parseError.message : "未知错误"}`);
      }
      
      // 使用 Zod Schema 验证
      let validated;
      try {
        validated = cardSchema.parse(parsed);
      } catch (validationError) {
        console.error("数据验证失败:", validationError);
        console.error("解析后的数据:", parsed);
        throw new Error(`数据验证失败: ${validationError instanceof Error ? validationError.message : "未知错误"}`);
      }
      
      console.log("JSON 解析和验证成功");
      return validated;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      
      // 处理超时错误
      if (fetchError.name === 'AbortError') {
        throw new Error("请求超时：DeepSeek API 响应时间超过 30 秒，请稍后重试");
      }
      
      // 重新抛出其他 fetch 错误
      throw fetchError;
    }
  } catch (error: any) {
    // 记录完整的错误信息（生产环境也会记录到 Vercel 日志）
    const errorDetails = {
      message: error?.message,
      status: error?.status,
      statusCode: error?.statusCode,
      statusText: error?.statusText,
      cause: error?.cause,
      name: error?.name,
      url: error?.url,
      stack: error?.stack?.split('\n').slice(0, 5), // 只记录前5行堆栈
    };
    
    console.error("=== DeepSeek API 错误详情 ===");
    console.error(JSON.stringify(errorDetails, null, 2));
    
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
        "账户余额不足！请访问 https://platform.deepseek.com/ 充值账户余额。"
      );
    }
    
    // 根据不同的错误类型提供更具体的错误信息
    if (error?.status === 404 || error?.statusCode === 404 || errorMessage.includes("Not Found")) {
      throw new Error(
        `API 端点未找到 (404)。请检查：1) API Key 是否有效 2) 环境变量是否配置 3) 账户余额是否充足。详情: ${errorMessage}`
      );
    }
    
    if (error?.status === 401 || error?.statusCode === 401 || errorMessage.includes("401")) {
      throw new Error("API Key 认证失败 (401)。请检查 Vercel 环境变量中的 DEEPSEEK_API_KEY 是否正确。");
    }
    
    if (error?.status === 429 || error?.statusCode === 429 || errorMessage.includes("429")) {
      throw new Error("请求频率过高 (429)。请稍后再试。");
    }
    
    // 网络错误
    if (errorMessage.includes("fetch") || errorMessage.includes("network") || errorMessage.includes("timeout")) {
      throw new Error(`网络请求失败: ${errorMessage}。请检查网络连接或稍后重试。`);
    }
    
    // JSON 解析错误
    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
      throw new Error(`数据解析失败: ${errorMessage}。请重试或联系技术支持。`);
    }
    
    // 数据验证错误
    if (errorMessage.includes("验证") || errorMessage.includes("validation")) {
      throw new Error(`数据验证失败: ${errorMessage}。AI 返回的数据格式不正确，请重试。`);
    }
    
    // 通用错误（确保错误信息对用户友好）
    const userFriendlyMessage = errorMessage || "未知错误";
    throw new Error(`生成卡片失败: ${userFriendlyMessage}。请检查 Vercel 日志获取更多信息。`);
  }
}

