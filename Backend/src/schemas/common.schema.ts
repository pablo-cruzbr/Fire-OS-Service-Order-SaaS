import { z } from "zod";

// Reaproveitado por qualquer schema que precise validar um :id de rota —
// extraído daqui em vez de duplicado, porque parava de fazer sentido morar
// só no ordemdeServico.schema.ts assim que o módulo de user precisou dele.
const uuid = z.string().uuid({ message: "ID inválido." });

const idParamSchema = z.object({
  id: uuid,
});

export { uuid, idParamSchema };
