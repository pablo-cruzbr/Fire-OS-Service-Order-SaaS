import { z } from "zod";

// Reaproveitado por qualquer schema que precise validar um :id de rota —
// extraído daqui em vez de duplicado, porque parava de fazer sentido morar
// só no ordemdeServico.schema.ts assim que o módulo de user precisou dele.
const uuid = z.string().uuid({ message: "ID inválido." });

const idParamSchema = z.object({
  id: uuid,
});

// Reaproveitado pelos 6 endpoints de Detail de controles_forms que recebem
// o id via query string (?controle_id=), não via :id — todos com o mesmo
// nome de campo, mesmo raciocínio do idParamSchema acima.
const controleIdQuerySchema = z.object({
  controle_id: uuid,
});

export { uuid, idParamSchema, controleIdQuerySchema };
