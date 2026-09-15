import { z } from "zod";
import { uuid } from "./common.schema";

const createLaboratorioSchema = z.object({
  nomedoEquipamento: z.string().min(1, "Nome do equipamento é obrigatório."),
  defeito: z.string().min(1, "Defeito é obrigatório."),
  marca: z.string().min(1, "Marca é obrigatória."),
  osDeAbertura: z.string().min(1, "OS de abertura é obrigatória."),
  osDeDevolucao: z.string().min(1, "OS de devolução é obrigatória."),
  data_de_Chegada: z.coerce.date(),
  data_de_Finalizacao: z.coerce.date(),
  statusControledeLaboratorio_id: uuid,
  instituicaoUnidade_id: uuid.optional(),
  cliente_id: uuid.optional(),
  equipamento_id: uuid.optional(),
});

const updateLaboratorioSchema = z.object({
  nomedoEquipamento: z.string().min(1).optional(),
  defeito: z.string().min(1).optional(),
  marca: z.string().min(1).optional(),
  osDeAbertura: z.string().min(1).optional(),
  osDeDevolucao: z.string().min(1).optional(),
  data_de_Chegada: z.coerce.date().optional(),
  data_de_Finalizacao: z.coerce.date().optional(),
  statusControledeLaboratorio_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
  cliente_id: uuid.optional(),
  equipamento_id: uuid.optional(),
});

type CreateLaboratorioInput = z.infer<typeof createLaboratorioSchema>;
type UpdateLaboratorioInput = z.infer<typeof updateLaboratorioSchema>;

export { createLaboratorioSchema, updateLaboratorioSchema };
export type { CreateLaboratorioInput, UpdateLaboratorioInput };
