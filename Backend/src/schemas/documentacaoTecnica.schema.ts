import { z } from "zod";
import { uuid } from "./common.schema";

const createDocumentacaoTecnicaSchema = z.object({
  titulo: z.string().min(1, "Título é obrigatório."),
  descricao: z.string().min(1, "Descrição é obrigatória."),
  tecnico_id: uuid,
  cliente_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

const updateDocumentacaoTecnicaSchema = z.object({
  titulo: z.string().min(1).optional(),
  descricao: z.string().min(1).optional(),
  tecnico_id: uuid.optional(),
  cliente_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

type CreateDocumentacaoTecnicaInput = z.infer<typeof createDocumentacaoTecnicaSchema>;
type UpdateDocumentacaoTecnicaInput = z.infer<typeof updateDocumentacaoTecnicaSchema>;

export { createDocumentacaoTecnicaSchema, updateDocumentacaoTecnicaSchema };
export type { CreateDocumentacaoTecnicaInput, UpdateDocumentacaoTecnicaInput };
