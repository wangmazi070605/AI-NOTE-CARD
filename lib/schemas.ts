import { z } from "zod";

/**
 * 心理诊断结果数据结构的 Zod Schema
 */
export const diagnosisSchema = z.object({
  emotionType: z.enum([
    "anxiety",      // 焦虑
    "lovebrain",    // 恋爱脑
    "emo",          // emo
    "happy",        // 开心
    "confused",     // 迷茫
    "angry",        // 愤怒
    "sad",          // 悲伤
    "excited",      // 兴奋
  ], {
    message: "情绪类型必须是预定义的类型之一",
  }),
  title: z.string().min(1, "诊断标题不能为空"),
  analysis: z.string().min(1, "诊断分析不能为空"),
  tags: z
    .array(z.string())
    .min(2, "至少包含2个标签")
    .max(5, "最多包含5个标签")
    .refine((tags) => tags.every((tag) => tag.length > 0), {
      message: "标签不能为空",
    }),
  emotionColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "必须是有效的 hex 颜色值（如 #FF5733 或 #F53）"),
  suggestions: z
    .array(z.string())
    .min(1, "至少包含1条建议")
    .max(3, "最多包含3条建议"),
  intensity: z.number().min(0).max(100, "情绪强度必须在0-100之间"),
});

/**
 * 心理诊断结果数据类型的 TypeScript 类型推断
 */
export type Diagnosis = z.infer<typeof diagnosisSchema>;

/**
 * 人格卡片数据结构的 Zod Schema
 */
export const personalityCardSchema = z.object({
  title: z.string().min(1, "人格标题不能为空"),
  rarity: z.enum(["N", "R", "SR", "SSR", "UR"], {
    message: "稀有度必须是 N, R, SR, SSR, UR 之一",
  }),
  analysis: z.object({
    comment: z.string().min(1, "毒舌判词不能为空"),
    hobbies: z.array(z.string()).min(1, "至少包含1个爱好"),
    compatible: z.string().min(1, "合拍人格不能为空"),
  }),
  stats: z.object({
    introversion: z.number().min(0).max(100),
    creativity: z.number().min(0).max(100),
    humor: z.number().min(0).max(100),
    logic: z.number().min(0).max(100),
    empathy: z.number().min(0).max(100),
    energy: z.number().min(0).max(100),
  }),
  visual: z.object({
    bgColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
    secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  }),
});

/**
 * 人格卡片数据类型的 TypeScript 类型推断
 */
export type PersonalityCard = z.infer<typeof personalityCardSchema>;

/**
 * 情感分析卡片数据结构的 Zod Schema
 */
export const fortuneCardSchema = z.object({
  date: z.string().min(1, "日期不能为空"),
  title: z.string().min(1, "标题不能为空"),
  emotionType: z.enum([
    "anxiety", "lovebrain", "emo", "happy", "confused", "angry", "sad", "excited",
  ]),
  analysis: z.string().min(1, "分析不能为空"),
  fortune: z.object({
    overall: z.string().min(1, "整体运势不能为空"),
    love: z.string().min(1, "感情运势不能为空"),
    career: z.string().min(1, "事业运势不能为空"),
    health: z.string().min(1, "健康运势不能为空"),
  }),
  tags: z.array(z.string()).min(2).max(5),
  emotionColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  suggestions: z.array(z.string()).min(1).max(3),
  intensity: z.number().min(0).max(100),
});

/**
 * 情感分析卡片数据类型的 TypeScript 类型推断
 */
export type FortuneCard = z.infer<typeof fortuneCardSchema>;

/**
 * 今日运势数据结构的 Zod Schema
 */
export const dailyFortuneSchema = z.object({
  date: z.string().min(1, "日期不能为空"),
  zodiac: z.string().min(1, "星座不能为空"),
  zodiacIcon: z.string().min(1, "星座图标不能为空"),
  overallScore: z.number().min(0).max(100, "综合运势分数必须在0-100之间"),
  loveStars: z.number().min(1).max(5, "爱情运势必须在1-5星之间"),
  careerStars: z.number().min(1).max(5, "事业运势必须在1-5星之间"),
  wealthStars: z.number().min(1).max(5, "财运必须在1-5星之间"),
  keywords: z.array(z.string()).min(1).max(3, "关键词最多3个"),
  luckyItem: z.string().min(1, "幸运物不能为空"),
  luckyColor: z.string().min(1, "幸运色不能为空"),
  luckyColorHex: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "必须是有效的 hex 颜色值"),
  shouldDo: z.array(z.string()).min(1).max(3, "宜事项最多3个"),
  shouldNotDo: z.array(z.string()).min(1).max(3, "忌事项最多3个"),
  zodiacFortune: z.string().min(1, "星座运势不能为空"),
  zodiacAnimalFortune: z.string().min(1, "属相运势不能为空"),
  loveFortune: z.string().min(1, "爱情运势不能为空"),
  careerFortune: z.string().min(1, "事业运势不能为空"),
  wealthFortune: z.string().min(1, "财运不能为空"),
  themeColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "主题色必须是有效的 hex 颜色值"),
  birthTime: z.string().optional(), // 出生时辰
  bazi: z.string().optional(), // 生辰八字
  name: z.string().optional(), // 用户姓名
});

/**
 * 今日运势数据类型的 TypeScript 类型推断
 */
export type DailyFortune = z.infer<typeof dailyFortuneSchema>;

