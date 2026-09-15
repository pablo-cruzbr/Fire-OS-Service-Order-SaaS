import { z } from "zod";
import { uuid } from "./common.schema";

// datadeChegada/datadeRetirada são String no schema.prisma (não DateTime),
// então validamos como texto não vazio — a conversão pra formato ISO
// continua acontecendo no Service, igual já era feito antes.
const createEstabilizadoresSchema = z.object({
  idChamado: z.string().min(1, "ID do chamado é obrigatório."),
  problema: z.string().min(1, "Problema é obrigatório."),
  observacoes: z.string(),
  osdaAssistencia: z.string().min(1, "OS da assistência é obrigatória."),
  datadeChegada: z.string().min(1, "Data de chegada é obrigatória."),
  datadeRetirada: z.string().min(1, "Data de retirada é obrigatória."),
  estabilizadores_id: uuid,
  statusEstabilizadores_id: uuid,
  instituicaoUnidade_id: uuid.optional(),
});

const updateEstabilizadoresSchema = z.object({
  idChamado: z.string().min(1).optional(),
  problema: z.string().min(1).optional(),
  observacoes: z.string().optional(),
  osdaAssistencia: z.string().min(1).optional(),
  datadeChegada: z.string().min(1).optional(),
  datadeRetirada: z.string().min(1).optional(),
  estabilizadores_id: uuid.optional(),
  statusEstabilizadores_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

type CreateEstabilizadoresInput = z.infer<typeof createEstabilizadoresSchema>;
type UpdateEstabilizadoresInput = z.infer<typeof updateEstabilizadoresSchema>;

export { createEstabilizadoresSchema, updateEstabilizadoresSchema };
export type { CreateEstabilizadoresInput, UpdateEstabilizadoresInput };
