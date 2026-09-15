import { z } from "zod";
import { uuid } from "./common.schema";

const createLaudoTecnicoSchema = z.object({
  descricaodoProblema: z.string().min(1, "Descrição do problema é obrigatória."),
  mesAno: z.coerce.date(),
  osLab: z.string().min(1, "OS do laboratório é obrigatória."),
  instituicaoUnidade_id: uuid,
  equipamento_id: uuid,
  tecnico_id: uuid,
});

const updateLaudoTecnicoSchema = z.object({
  descricaodoProblema: z.string().min(1).optional(),
  mesAno: z.coerce.date().optional(),
  osLab: z.string().min(1).optional(),
  instituicaoUnidade_id: uuid.optional(),
  equipamento_id: uuid.optional(),
  tecnico_id: uuid.optional(),
});

type CreateLaudoTecnicoInput = z.infer<typeof createLaudoTecnicoSchema>;
type UpdateLaudoTecnicoInput = z.infer<typeof updateLaudoTecnicoSchema>;

export { createLaudoTecnicoSchema, updateLaudoTecnicoSchema };
export type { CreateLaudoTecnicoInput, UpdateLaudoTecnicoInput };
