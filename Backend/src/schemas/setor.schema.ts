import { z } from "zod";
import { uuid } from "./common.schema";

const createSetorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
});

// Sem caller no Frontend hoje (achado no rollout) — mantido como query em
// vez de :id, mesmo contrato de antes, só validado agora.
const deleteSetorQuerySchema = z.object({
  setor_id: uuid,
});

type CreateSetorInput = z.infer<typeof createSetorSchema>;

export { createSetorSchema, deleteSetorQuerySchema };
export type { CreateSetorInput };
