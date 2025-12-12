"use server";

import { dailyFortuneSchema, type DailyFortune } from "@/lib/schemas";

/**
 * 根据出生日期计算星座
 */
function getZodiac(birthDate: Date): { name: string; icon: string } {
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) {
    return { name: "白羊座", icon: "♈" };
  } else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) {
    return { name: "金牛座", icon: "♉" };
  } else if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) {
    return { name: "双子座", icon: "♊" };
  } else if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) {
    return { name: "巨蟹座", icon: "♋" };
  } else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) {
    return { name: "狮子座", icon: "♌" };
  } else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) {
    return { name: "处女座", icon: "♍" };
  } else if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) {
    return { name: "天秤座", icon: "♎" };
  } else if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) {
    return { name: "天蝎座", icon: "♏" };
  } else if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) {
    return { name: "射手座", icon: "♐" };
  } else if (month === 12 && day >= 22) {
    return { name: "摩羯座", icon: "♑" };
  } else if (month === 1 && day <= 19) {
    return { name: "摩羯座", icon: "♑" };
  } else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) {
    return { name: "水瓶座", icon: "♒" };
  } else {
    return { name: "双鱼座", icon: "♓" };
  }
}

/**
 * 根据出生年份计算生肖
 */
function getZodiacAnimal(birthYear: number): string {
  const animals = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
  return animals[(birthYear - 4) % 12];
}

/**
 * 天干地支数组
 */
const TIAN_GAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const DI_ZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

/**
 * 时辰对应地支的索引
 */
const TIME_TO_DIZHI: Record<string, number> = {
  "子": 0, "丑": 1, "寅": 2, "卯": 3, "辰": 4, "巳": 5,
  "午": 6, "未": 7, "申": 8, "酉": 9, "戌": 10, "亥": 11,
};

/**
 * 计算生辰八字
 */
function calculateBaZi(birthDate: Date, birthTime: string): string {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  // 年柱：以立春为界，但简化处理，使用农历新年
  // 简化算法：以春节（2月4日左右）为界
  let yearOffset = year - 1900; // 1900年为庚子年
  if (month < 2 || (month === 2 && day < 4)) {
    yearOffset -= 1;
  }
  const yearGan = yearOffset % 10;
  const yearZhi = yearOffset % 12;
  
  // 月柱：以节气为界，简化处理使用月份
  // 简化算法：每月的地支固定，天干根据年干推算
  const monthZhiIndex = (month - 1 + 1) % 12; // 正月为寅，所以+1
  const monthGanIndex = (yearGan * 2 + monthZhiIndex) % 10;
  
  // 日柱：需要查表，简化使用固定算法
  // 简化算法：使用公历日期计算（实际上应该用农历）
  const dayOffset = Math.floor((year - 1900) * 365.25 + (month - 1) * 30.44 + day);
  const dayGan = dayOffset % 10;
  const dayZhi = dayOffset % 12;
  
  // 时柱：根据出生时辰确定地支，天干根据日干推算
  const timeZhiIndex = TIME_TO_DIZHI[birthTime] || 0;
  const timeGanIndex = (dayGan * 2 + timeZhiIndex) % 10;
  
  return `${TIAN_GAN[yearGan]}${DI_ZHI[yearZhi]} ${TIAN_GAN[monthGanIndex]}${DI_ZHI[monthZhiIndex]} ${TIAN_GAN[dayGan]}${DI_ZHI[dayZhi]} ${TIAN_GAN[timeGanIndex]}${DI_ZHI[timeZhiIndex]}`;
}

/**
 * 生成随机运势分数（基于日期和用户信息的伪随机）
 */
function generateFortuneScore(name: string, birthDate: Date, currentDate: Date): number {
  // 使用日期和用户信息生成伪随机数，确保同一天同一用户得到相同结果
  const dateStr = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const seed = name.length * 1000 + birthDate.getTime() % 10000 + dateStr.length * 100;
  // 使用简单的哈希算法
  let hash = 0;
  const seedStr = seed.toString();
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash) % 101; // 0-100
}

/**
 * 生成随机星级（1-5星），基于不同维度的独立计算
 */
function generateStars(name: string, birthDate: Date, currentDate: Date, category: string): number {
  // 为不同类别生成不同的种子，确保独立性
  const dateStr = currentDate.toISOString().split('T')[0];
  const categoryHash = category.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = name.length * 1000 + birthDate.getTime() % 10000 + dateStr.length * 100 + categoryHash * 50;
  
  let hash = 0;
  const seedStr = seed.toString();
  for (let i = 0; i < seedStr.length; i++) {
    hash = ((hash << 5) - hash) + seedStr.charCodeAt(i);
    hash = hash & hash;
  }
  
  // 生成 0-99 的分数
  const categoryScore = Math.abs(hash) % 100;
  
  // 根据分数映射到 1-5 星
  if (categoryScore >= 80) return 5;
  if (categoryScore >= 60) return 4;
  if (categoryScore >= 40) return 3;
  if (categoryScore >= 20) return 2;
  return 1;
}

/**
 * 根据分数生成主题色
 */
function getThemeColor(score: number): string {
  if (score >= 80) return "#10b981"; // 绿色 - 很好
  if (score >= 60) return "#3b82f6"; // 蓝色 - 不错
  if (score >= 40) return "#f59e0b"; // 橙色 - 一般
  return "#ef4444"; // 红色 - 较差
}

/**
 * 生成今日运势的 Server Action
 * @param name 用户姓名
 * @param birthDate 出生日期
 * @param birthTime 出生时辰（子、丑、寅等）
 * @returns 生成的今日运势
 */
export async function generateDailyFortune(
  name: string,
  birthDate: Date,
  birthTime: string,
  targetDate?: Date  // 可选的目标日期，用于查询特定日期的运势
): Promise<DailyFortune> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY 环境变量未设置");
  }

  // 使用传入的目标日期，如果没有则使用当前日期
  const currentDate = targetDate || new Date();
  const today = currentDate.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  // 计算星座和生肖
  const zodiac = getZodiac(birthDate);
  const zodiacAnimal = getZodiacAnimal(birthDate.getFullYear());

  // 计算生辰八字
  const bazi = calculateBaZi(birthDate, birthTime);

  try {
    console.log("=== 生成今日运势 ===");
    console.log("用户:", name);
    console.log("出生日期:", birthDate.toLocaleDateString());
    console.log("出生时辰:", birthTime);
    console.log("生辰八字:", bazi);
    console.log("星座:", zodiac.name);
    console.log("生肖:", zodiacAnimal);
    console.log("今日日期:", today);

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
              content: `你是一位专业的占星师和生辰八字专家，拥有深厚的传统命理学和现代占星学知识。你的职责是根据用户提供的生辰八字、星座、生肖等信息，结合当前日期，进行专业的运势分析和评分。

重要原则：
1. **根据专业分析计算分数和星级**：你要像真正的命理师一样，基于生辰八字、星座、生肖、当前日期等综合因素，客观评估运势，给出0-100分的综合运势分数，以及爱情、事业、财运的1-5星评级。
2. **合理分配分数，不要过度保守**：
   - 运势分数应该呈正态分布：大部分时候在 50-80 分之间，偶尔会有 80-95 分的好运，偶尔会有 20-50 分的低迷期
   - **不要总是给低分！** 如果分析结果一般或普通，应该给 55-75 分（这是最常见的情况）
   - 如果各方面都比较顺，应该给 65-80 分和 4 星
   - 只有当明确分析出不利因素时，才给 30-55 分和 2-3 星
   - 如果各方面都很有利，应该给 75-90 分和 4-5 星
   - 分数要多样化，不要总是集中在低分段
3. **结合专业分析**：要基于生辰八字、星座、生肖的专业知识来分析，例如：
   - 分析八字中天干地支的相生相克关系
   - 分析星座在当前时间段的位置和影响
   - 分析生肖与当前年份的关系
   - 分析出生时辰对运势的影响
4. **分数要真实合理**：
   - 如果看不出明显的不利因素，就应该给中等偏上的分数（60-75分）
   - 如果有一些小问题但整体尚可，给 60-70 分
   - 只有在明确分析出不利因素时，才给低分
5. 风格要现代、年轻、有网感，但必须建立在专业和真实的基础上

你的评分要客观、专业，但也要合理。不要过度保守，大部分人的日常运势应该是中等偏上的（60-75分）。`,
            },
            {
              role: "user",
              content: `请根据以下信息生成今日运势（必须是有效的 JSON，不要包含任何其他文字）：

用户信息：
- 姓名：${name}
- 出生日期：${birthDate.toLocaleDateString("zh-CN")}
- 出生时辰：${birthTime}时
- 生辰八字：${bazi}
- 星座：${zodiac.name}
- 生肖：${zodiacAnimal}
- 今日日期：${today}

请作为专业占星师和生辰八字专家，根据以上信息分析今日运势，并按照以下 JSON 格式输出：

{
  "date": "${today}",
  "zodiac": "${zodiac.name}",
  "zodiacIcon": "${zodiac.icon}",
  "overallScore": 你要评估的综合运势分数（0-100分，必须基于生辰八字、星座、生肖的专业分析，合理分配：一般情况给55-75分，较好给65-85分，很好给75-90分，只有明确不利时才给30-55分）,
  "loveStars": 你要评估的爱情运势星级（1-5星，必须基于专业分析，不要随意给5星）,
  "careerStars": 你要评估的事业运势星级（1-5星，必须基于专业分析，不要随意给5星）,
  "wealthStars": 你要评估的财运星级（1-5星，必须基于专业分析，不要随意给5星）,
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "luckyItem": "幸运物（如：冰美式、蓝牙耳机）",
  "luckyColor": "幸运色名称（如：克莱因蓝、樱花粉）",
  "luckyColorHex": "#颜色值",
  "shouldDo": ["宜事项1", "宜事项2", "宜事项3"],
  "shouldNotDo": ["忌事项1", "忌事项2", "忌事项3"],
  "zodiacFortune": "星座运势分析（50-100字，结合星座和整体运势分数进行分析）",
  "zodiacAnimalFortune": "属相运势分析（50-100字，结合生肖和当前年月分析）",
  "loveFortune": "爱情运势分析（50-100字，必须根据你评估的爱情星级来分析，如实反映运势好坏）",
  "careerFortune": "事业运势分析（50-100字，必须根据你评估的事业星级来分析，如实反映运势好坏）",
  "wealthFortune": "财运分析（50-100字，必须根据你评估的财运星级来分析，如实反映运势好坏）",
  "themeColor": "根据整体运势分数生成主题色：#10b981（>=80分绿色）、#3b82f6（60-79分蓝色）、#f59e0b（40-59分橙色）、#ef4444（<40分红色）",
  "birthTime": "${birthTime}",
  "bazi": "${bazi}"
}

要求：
1. **根据专业分析计算分数和星级**（最重要）：
   - 仔细分析生辰八字：看天干地支的相生相克、五行平衡、是否有相冲相刑
   - 分析星座：结合当前日期，看星座在年度周期中的位置，是否有行星逆行影响
   - 分析生肖：看生肖与当前年份的关系，是否相冲、相刑、相害
   - 分析出生时辰：看时辰对各方面运势的影响
   - 基于以上专业分析，给出客观但合理的分数和星级：
     * **如果各方面都不利**（明确分析出不利因素）：给30-50分，2-3星
     * **如果一般或普通**（没有明显好坏）：给50-70分，3-4星（这是最常见的情况！）
     * **如果较好**：给65-80分，4星
     * **如果很好**（各方面都很有利）：给75-90分，4-5星
   - **重要：不要过度保守！** 如果没有明确的不利因素，就应该给中等偏上的分数（60-75分）。大部分人的日常运势应该是中等偏上的。
2. **真实评估，不讨好用户**：
   - 不要因为用户可能不满意就给高分，要像真正的命理师一样客观
   - 如果分析结果确实不好，就要如实告知，这样用户才能提前准备
   - 如果分析结果一般，就如实说明，不要夸大
   - 只有真正好的时候才能说好，而且要给出合理的建议
3. **结合专业分析**：要基于生辰八字、星座、生肖的专业知识来分析，而不是空洞的鼓励。例如：
   - 如果八字中某柱相冲（如子午冲、寅申冲），要提到需要注意的方面
   - 如果星座处于困难时期（如水逆、土逆），要如实说明
   - 如果生肖与当前年份相冲（如鼠年马冲），要指出需要谨慎
4. **关键词要有网感**：如"断舍离"、"桃花朵朵"、"搞钱"、"水逆"等，但要符合实际情况
5. **幸运物和幸运色**：要现代、年轻化，如"冰美式"、"克莱因蓝"等
6. **宜忌事项**：要实用、有趣，如"宜表白"、"忌借钱"等，但必须符合运势的实际情况
7. **themeColor**：根据你给出的整体运势分数，自动选择对应的颜色值

记住：作为专业占星师，你的价值在于真实和准确。你要根据专业知识客观分析，给出合理的评分。
- 如果看不出明显的不利因素，给 60-75 分（这是最常见的分数区间）
- 如果各方面都比较顺，给 65-85 分
- 如果很好，给 75-90 分
- 只有在明确分析出不利因素时，才给 30-55 分
不要过度保守，大部分人的日常运势应该是中等偏上的。

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
      // 确保生辰八字、出生时辰和用户姓名被包含
      parsed.birthTime = birthTime;
      parsed.bazi = bazi;
      parsed.name = name;
      const validated = dailyFortuneSchema.parse(parsed);

      console.log("今日运势生成成功");
      return validated;
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        throw new Error("请求超时：DeepSeek API 响应时间超过 30 秒");
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("生成今日运势错误:", error);

    const errorMessage = error?.message || "";

    if (errorMessage.includes("Insufficient Balance") || errorMessage.includes("余额不足")) {
      throw new Error("账户余额不足！请访问 https://platform.deepseek.com/ 充值");
    }

    if (errorMessage.includes("JSON") || errorMessage.includes("parse")) {
      throw new Error(`数据解析失败: ${errorMessage}。请重试。`);
    }

    throw new Error(`生成今日运势失败: ${errorMessage || "未知错误"}`);
  }
}

