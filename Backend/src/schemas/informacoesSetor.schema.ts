import { z } from "zod";
import { uuid } from "./common.schema";

// usuario/andar/ramal são String? no schema.prisma (opcionais no banco) —
// mantido opcional aqui também, em vez de forçar obrigatório sem confirmar
// que o formulário sempre preenche os 3.
const createInformacoesSetorSchema = z.object({
  setorId: uuid,
  usuario: z.string().optional(),
  andar: z.string().optional(),
  ramal: z.string().optional(),
  clienteId: uuid.nullable().optional(),
  instituicaoUnidadeId: uuid.nullable().optional(),
});

const updateInformacoesSetorSchema = z.object({
  setorId: uuid.optional(),
  usuario: z.string().optional(),
  andar: z.string().optional(),
  ramal: z.string().optional(),
  clienteId: uuid.nullable().optional(),
  instituicaoUnidadeId: uuid.nullable().optional(),
});

type CreateInformacoesSetorInput = z.infer<typeof createInformacoesSetorSchema>;
type UpdateInformacoesSetorInput = z.infer<typeof updateInformacoesSetorSchema>;

export { createInformacoesSetorSchema, updateInformacoesSetorSchema };
export type { CreateInformacoesSetorInput, UpdateInformacoesSetorInput };
