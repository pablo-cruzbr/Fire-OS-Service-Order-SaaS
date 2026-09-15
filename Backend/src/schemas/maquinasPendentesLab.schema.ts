import { z } from "zod";
import { uuid } from "./common.schema";

const createMaquinasPendentesLabSchema = z.object({
  numeroDeSerie: z.string().min(1, "Número de série é obrigatório."),
  ssd: z.string().min(1, "SSD é obrigatório."),
  idDaOs: z.string().min(1, "ID da OS é obrigatório."),
  obs: z.string(),
  equipamento_id: uuid,
  statusMaquinasPendentesLab_id: uuid,
  instituicaoUnidade_id: uuid.optional(),
});

const updateMaquinasPendentesLabSchema = z.object({
  numeroDeSerie: z.string().min(1).optional(),
  ssd: z.string().min(1).optional(),
  idDaOs: z.string().min(1).optional(),
  obs: z.string().optional(),
  equipamento_id: uuid.optional(),
  statusMaquinasPendentesLab_id: uuid.optional(),
  instituicaoUnidade_id: uuid.optional(),
});

type CreateMaquinasPendentesLabInput = z.infer<typeof createMaquinasPendentesLabSchema>;
type UpdateMaquinasPendentesLabInput = z.infer<typeof updateMaquinasPendentesLabSchema>;

export { createMaquinasPendentesLabSchema, updateMaquinasPendentesLabSchema };
export type { CreateMaquinasPendentesLabInput, UpdateMaquinasPendentesLabInput };
