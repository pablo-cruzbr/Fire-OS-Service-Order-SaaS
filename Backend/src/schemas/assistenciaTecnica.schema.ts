import { z } from "zod";
import { uuid } from "./common.schema";

const createAssistenciaTecnicaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  mesAno: z.coerce.date(),
  idChamado: z.string().min(1, "ID do chamado é obrigatório."),
  assistencia: z.string().min(1, "Assistência é obrigatória."),
  observacoes: z.string(),
  osDaAssistencia: z.string().min(1, "OS da assistência é obrigatória."),
  dataDeRetirada: z.coerce.date(),
  equipamento_id: uuid,
  statusReparo_id: uuid,
  tecnico_id: uuid,
  instituicaoUnidade_id: uuid.optional(),
  cliente_id: uuid.optional(),
});

const updateAssistenciaTecnicaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").optional(),
  mesAno: z.coerce.date().optional(),
  idChamado: z.string().min(1).optional(),
  assistencia: z.string().min(1).optional(),
  observacoes: z.string().optional(),
  osDaAssistencia: z.string().min(1).optional(),
  dataDeRetirada: z.coerce.date().optional(),
  equipamento_id: uuid.optional(),
  statusReparo_id: uuid.optional(),
  tecnico_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
  cliente_id: uuid.optional(),
});

type CreateAssistenciaTecnicaInput = z.infer<typeof createAssistenciaTecnicaSchema>;
type UpdateAssistenciaTecnicaInput = z.infer<typeof updateAssistenciaTecnicaSchema>;

export { createAssistenciaTecnicaSchema, updateAssistenciaTecnicaSchema };
export type { CreateAssistenciaTecnicaInput, UpdateAssistenciaTecnicaInput };
