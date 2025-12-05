import { z } from "zod";

/**
 * 卡片数据结构的 Zod Schema
 */
export const cardSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  summary: z.string().min(1, "内容摘要不能为空"),
  tags: z
    .array(z.string())
    .length(3, "必须包含3个标签")
    .refine((tags) => tags.every((tag) => tag.length > 0), {
      message: "标签不能为空",
    }),
  colorTheme: z.enum(["blue", "green", "red", "purple", "yellow"], {
    errorMap: () => ({ message: "颜色主题必须是 blue, green, red, purple 或 yellow 之一" }),
  }),
  borderColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "必须是有效的 hex 颜色值（如 #FF5733 或 #F53）"),
});

/**
 * 卡片数据类型的 TypeScript 类型推断
 */
export type Card = z.infer<typeof cardSchema>;

