import { z } from "zod";
import { uuid } from "./common.schema";

// name é obrigatório no schema.prisma, endereco/telefone/cnpj são opcionais
// no banco — mas o Service original sempre exigiu cnpj não vazio (regra de
// negócio mais estrita que a constraint do banco), mantida aqui.
const createClienteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  cnpj: z.string().min(1, "CNPJ é obrigatório."),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
});

const updateClienteSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  cnpj: z.string().min(1, "CNPJ é obrigatório."),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
});

// GET /cliente/detail?controle_id= — único endpoint do módulo que recebe o
// id via query em vez de :id.
const detailClienteQuerySchema = z.object({
  controle_id: uuid,
});

type CreateClienteInput = z.infer<typeof createClienteSchema>;
type UpdateClienteInput = z.infer<typeof updateClienteSchema>;

export { createClienteSchema, updateClienteSchema, detailClienteQuerySchema };
export type { CreateClienteInput, UpdateClienteInput };
