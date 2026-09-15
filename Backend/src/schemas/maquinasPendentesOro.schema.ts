import { z } from "zod";
import { uuid } from "./common.schema";

const createMaquinasPendentesOroSchema = z.object({
  datadaInstalacao: z.coerce.date(),
  osInstalacao: z.string().min(1, "OS de instalação é obrigatória."),
  osRetirada: z.string().min(1, "OS de retirada é obrigatória."),
  equipamento_id: uuid,
  // Diferente do módulo "Lab": aqui instituicaoUnidade_id é obrigatório no
  // schema.prisma (sem `?`) — checar campo a campo em vez de assumir que os
  // dois módulos "MaquinasPendentes" são iguais.
  instituicaoUnidade_id: uuid,
  statusMaquinasPendentesOro_id: uuid,
});

const updateMaquinasPendentesOroSchema = z.object({
  datadaInstalacao: z.coerce.date().optional(),
  osInstalacao: z.string().min(1).optional(),
  osRetirada: z.string().min(1).optional(),
  equipamento_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
  statusMaquinasPendentesOro_id: uuid.optional(),
});

type CreateMaquinasPendentesOroInput = z.infer<typeof createMaquinasPendentesOroSchema>;
type UpdateMaquinasPendentesOroInput = z.infer<typeof updateMaquinasPendentesOroSchema>;

export { createMaquinasPendentesOroSchema, updateMaquinasPendentesOroSchema };
export type { CreateMaquinasPendentesOroInput, UpdateMaquinasPendentesOroInput };
