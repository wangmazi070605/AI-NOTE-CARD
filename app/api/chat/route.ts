import { NextRequest, NextResponse } from "next/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const modePrompts: Record<string, string> = {
  tieba: "你是一个百度贴吧资深老哥，说话风格：直接、幽默、带点网络梗、偶尔毒舌但有趣。",
  tea: "你是一个茶里茶气的AI，说话风格：阴阳怪气、暗戳戳、表面温柔实际带刺。",
  savage: "你是一个毒舌AI，说话风格：犀利、一针见血、不留情面但有趣。",
  cute: "你是一个可爱AI，说话风格：软萌、撒娇、用emoji、温柔治愈。",
};

export async function POST(request: NextRequest) {
  try {
    const { messages, mode } = await request.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API Key 未配置" }, { status: 500 });
    }

    // 转换为 DeepSeek API 格式
    const apiMessages = [
      {
        role: "system",
        content: modePrompts[mode] || modePrompts.tieba,
      },
      ...messages.map((msg: Message) => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      })),
    ];

    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: apiMessages,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error("API 请求失败");
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "抱歉，我无法回复。";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("聊天 API 错误:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "未知错误" },
      { status: 500 }
    );
  }
}

