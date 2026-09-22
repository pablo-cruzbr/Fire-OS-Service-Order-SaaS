import { z } from "zod";
import { uuid } from "./common.schema";

// Mantido como "troca tudo" (não parcial), igual a validação manual que já
// existia antes do Zod: name/endereco/tipodeInstituicaoUnidade_id sempre
// obrigatórios, mesmo no update — telefone é o único opcional no
// schema.prisma (`telefone String?`).
const updateInstituicaoUnidadeSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  endereco: z.string().min(1, "Endereço é obrigatório."),
  telefone: z.string().optional(),
  tipodeInstituicaoUnidade_id: uuid,
});

const createInstituicaoUnidadeSchema = updateInstituicaoUnidadeSchema;

const deleteInstituicaoUnidadeQuerySchema = z.object({
  instituicao_id: uuid,
});

type UpdateInstituicaoUnidadeInput = z.infer<typeof updateInstituicaoUnidadeSchema>;
type CreateInstituicaoUnidadeInput = z.infer<typeof createInstituicaoUnidadeSchema>;

export { updateInstituicaoUnidadeSchema, createInstituicaoUnidadeSchema, deleteInstituicaoUnidadeQuerySchema };
export type { UpdateInstituicaoUnidadeInput, CreateInstituicaoUnidadeInput };
