import { Request, Response, NextFunction } from "express";
import { subject } from "@casl/ability";
import prismaClient from "../prisma";
import { defineAbilityFor } from "../permissions/ability";

// Autoriza leitura/edição de UMA ordem de serviço específica, considerando
// quem é o dono (tecnico_id) — não só a role. Usa CASL em cima do RBAC
// básico do can.ts. Ver estudos-pleno/ROADMAP-PLENO.md, item 1.
export function authorizeOrdemdeServico(action: "read" | "update") {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const ordem = await prismaClient.ordemdeServico.findUnique({
      where: { id },
      select: { id: true, tecnico_id: true },
    });

    if (!ordem) {
      return res.status(404).json({ error: "Ordem de serviço não encontrada." });
    }

    const ability = defineAbilityFor({
      role: req.user_role,
      tecnico_id: req.user_tecnico_id,
    });

    if (ability.cannot(action, subject("OrdemdeServico", ordem))) {
      return res.status(403).json({
        error: "Você não tem permissão para acessar esta ordem de serviço.",
      });
    }

    return next();
  };
}
