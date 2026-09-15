import { z } from "zod";
import { uuid } from "./common.schema";

const createEquipamentoSchema = z.object({
  name: z.string().min(1, "Nome do equipamento é obrigatório."),
  patrimonio: z.string().min(1, "Patrimônio é obrigatório."),
  instituicaoUnidade_id: uuid.optional(),
  tipodeEquipamento_id: uuid.optional(),
});

const updateEquipamentoSchema = z.object({
  name: z.string().min(1).optional(),
  patrimonio: z.string().min(1).optional(),
  instituicaoUnidade_id: uuid.optional(),
  tipodeEquipamento_id: uuid.optional(),
});

type CreateEquipamentoInput = z.infer<typeof createEquipamentoSchema>;
type UpdateEquipamentoInput = z.infer<typeof updateEquipamentoSchema>;

export { createEquipamentoSchema, updateEquipamentoSchema };
export type { CreateEquipamentoInput, UpdateEquipamentoInput };
