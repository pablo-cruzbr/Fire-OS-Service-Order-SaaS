import { z } from "zod";

const listAtividadeQuerySchema = z.object({
  categoria: z.enum(["EXTERNO", "LABORATORIO"]).optional(),
});

type ListAtividadeQuery = z.infer<typeof listAtividadeQuerySchema>;

export { listAtividadeQuerySchema };
export type { ListAtividadeQuery };
