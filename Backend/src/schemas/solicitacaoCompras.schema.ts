import { z } from "zod";
import { uuid } from "./common.schema";

const createSolicitacaoComprasSchema = z.object({
  itemSolicitado: z.string().min(1, "Item solicitado é obrigatório."),
  solicitante: z.string().min(1, "Solicitante é obrigatório."),
  motivoDaSolicitacao: z.string().min(1, "Motivo da solicitação é obrigatório."),
  preco: z.coerce.number().nonnegative("Preço não pode ser negativo."),
  linkDeCompra: z.string().min(1, "Link de compra é obrigatório."),
  statusCompras_id: uuid,
});

const updateSolicitacaoComprasSchema = z.object({
  itemSolicitado: z.string().min(1).optional(),
  solicitante: z.string().min(1).optional(),
  motivoDaSolicitacao: z.string().min(1).optional(),
  preco: z.coerce.number().nonnegative().optional(),
  linkDeCompra: z.string().min(1).optional(),
  statusCompras_id: uuid.optional(),
});

type CreateSolicitacaoComprasInput = z.infer<typeof createSolicitacaoComprasSchema>;
type UpdateSolicitacaoComprasInput = z.infer<typeof updateSolicitacaoComprasSchema>;

export { createSolicitacaoComprasSchema, updateSolicitacaoComprasSchema };
export type { CreateSolicitacaoComprasInput, UpdateSolicitacaoComprasInput };
