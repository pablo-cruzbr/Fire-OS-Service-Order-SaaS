import prismaClient from "../prisma";
import { authorizeOwnership } from "./authorizeOwnership";

// Autoriza leitura/edição de UMA ordem de serviço específica, considerando
// quem é o dono (tecnico_id) — não só a role. Usa CASL em cima do RBAC
// básico do can.ts. Ver estudos-pleno/ROADMAP-PLENO.md, item 1.
export function authorizeOrdemdeServico(action: "read" | "update") {
  return authorizeOwnership(
    "OrdemdeServico",
    action,
    (id) =>
      prismaClient.ordemdeServico.findUnique({
        where: { id },
        select: { id: true, tecnico_id: true },
      }),
    "Ordem de serviço não encontrada.",
    "Você não tem permissão para acessar esta ordem de serviço."
  );
}
