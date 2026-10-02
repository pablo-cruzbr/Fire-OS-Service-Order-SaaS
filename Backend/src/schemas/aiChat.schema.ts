import { z } from "zod";

const aiChatSchema = z.object({
  question: z.string().min(1, "Pergunta é obrigatória."),
});

type AIChatInput = z.infer<typeof aiChatSchema>;

export { aiChatSchema };
export type { AIChatInput };
