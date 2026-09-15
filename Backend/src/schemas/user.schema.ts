import { z } from "zod";
import { uuid } from "./common.schema";

const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres."),
  cliente_id: uuid.optional(),
  setor_id: uuid.optional(),
  tecnico_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório.").optional(),
  email: z.string().email("Email inválido.").optional(),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres.").optional(),
  cliente_id: uuid.optional(),
  setor_id: uuid.optional(),
  tecnico_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

const authUserSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(1, "Senha é obrigatória."),
});

type CreateUserInput = z.infer<typeof createUserSchema>;
type UpdateUserInput = z.infer<typeof updateUserSchema>;
type AuthUserInput = z.infer<typeof authUserSchema>;

export { createUserSchema, updateUserSchema, authUserSchema };
export type { CreateUserInput, UpdateUserInput, AuthUserInput };
