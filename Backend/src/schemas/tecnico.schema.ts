import { z } from "zod";

const createTecnicoSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório."),
});

type CreateTecnicoInput = z.infer<typeof createTecnicoSchema>;

export { createTecnicoSchema };
export type { CreateTecnicoInput };
