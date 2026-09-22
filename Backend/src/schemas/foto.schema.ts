import { z } from "zod";
import { uuid } from "./common.schema";

const fotoSchema = z.object({
  ordemdeServico_id: uuid,
});

type FotoInput = z.infer<typeof fotoSchema>;

export { fotoSchema };
export type { FotoInput };
