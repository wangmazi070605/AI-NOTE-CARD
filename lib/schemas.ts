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

