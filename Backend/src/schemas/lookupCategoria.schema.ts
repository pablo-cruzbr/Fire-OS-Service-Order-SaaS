import { z } from "zod";
import { uuid } from "./common.schema";

// Schema único e genérico pra qualquer "tabela de lookup" de status_categorias
// (statusCompras, tarefa, tipodeChamado, etc.) — todas têm exatamente o mesmo
// formato de entrada: só um campo `name`. Em vez de 13 schemas quase
// idênticos, um só, reaproveitado em todos os módulos desse grupo.
const createLookupCategoriaSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
});

// Só o `statusOrdemdeServico` tem rota de Delete hoje nesse grupo, e o id
// vem via query string (`?statusOrdem_id=`), não via `:id` no path — mantido
// assim de propósito pra não mudar o contrato que o Frontend já usa.
const deleteStatusOrdemdeServicoQuerySchema = z.object({
  statusOrdem_id: uuid,
});

type CreateLookupCategoriaInput = z.infer<typeof createLookupCategoriaSchema>;

export { createLookupCategoriaSchema, deleteStatusOrdemdeServicoQuerySchema };
export type { CreateLookupCategoriaInput };
