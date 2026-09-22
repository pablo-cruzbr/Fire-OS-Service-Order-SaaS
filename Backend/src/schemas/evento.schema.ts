import { z } from "zod";

// Diferente do resto do projeto: Event usa id numérico autoincrement
// (schema.prisma), não uuid — não dá pra reaproveitar o `idParamSchema`
// compartilhado, que valida uuid.
const eventoIdParamSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido."),
});

const createEventoSchema = z.object({
  text: z.string().min(1, "Texto é obrigatório."),
  start_date: z.string().min(1, "Data de início é obrigatória."),
  end_date: z.string().min(1, "Data de término é obrigatória."),
});

// O Update deste módulo recebe o id pelo body (PUT /events), não por :id na
// URL — mantido assim de propósito pra não mudar o contrato que o Frontend
// já usa.
const updateEventoSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido."),
  text: z.string().min(1).optional(),
  start_date: z.string().min(1).optional(),
  end_date: z.string().min(1).optional(),
});

type CreateEventoInput = z.infer<typeof createEventoSchema>;
type UpdateEventoInput = z.infer<typeof updateEventoSchema>;

export { eventoIdParamSchema, createEventoSchema, updateEventoSchema };
export type { CreateEventoInput, UpdateEventoInput };
