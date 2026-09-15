import { Request, Response, NextFunction } from "express";
import { subject } from "@casl/ability";
import { defineAbilityFor, OwnableSubject } from "../permissions/ability";

interface OwnableRecord {
  id: string;
  tecnico_id: string | null;
}

// Generaliza o que era só o authorizeOrdemdeServico.ts pra qualquer recurso
// que segue o mesmo formato de dono (um campo tecnico_id): busca o registro,
// monta a ability do usuário logado, barra com 403 se a condição não bater.
// Ver estudos-pleno/fire-os/GUIA-RBAC-CASL.md, "Revisão 14/09/2026", pro
// achado que motivou generalizar isso em vez de copiar o middleware 3 vezes.
export function authorizeOwnership(
  subjectName: OwnableSubject,
  action: "read" | "update",
  findRecord: (id: string) => Promise<OwnableRecord | null>,
  notFoundMessage: string,
  forbiddenMessage: string = "Você não tem permissão para acessar este registro."
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const record = await findRecord(id);

    if (!record) {
      return res.status(404).json({ error: notFoundMessage });
    }

    const ability = defineAbilityFor({
      role: req.user_role,
      tecnico_id: req.user_tecnico_id,
    });

    if (ability.cannot(action, subject(subjectName, record))) {
      return res.status(403).json({ error: forbiddenMessage });
    }

    return next();
  };
}
