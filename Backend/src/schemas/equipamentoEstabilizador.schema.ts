import { z } from "zod";

const createEquipamentoEstabilizadorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  patrimonio: z.string().min(1, "Patrimônio é obrigatório."),
});

type CreateEquipamentoEstabilizadorInput = z.infer<typeof createEquipamentoEstabilizadorSchema>;

export { createEquipamentoEstabilizadorSchema };
export type { CreateEquipamentoEstabilizadorInput };
