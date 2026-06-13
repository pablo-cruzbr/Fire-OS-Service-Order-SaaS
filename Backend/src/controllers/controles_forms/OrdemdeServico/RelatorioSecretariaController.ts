import { Request, Response } from "express";
import { RelatorioSecretariaService } from "../../../services/controles_forms/OrdemdeServico/RelatorioSecretariaService";

class RelatorioSecretariaController {
  async handle(req: Request, res: Response) {
    const { tiposIds, startDate, endDate } = req.query;

    const ids = typeof tiposIds === "string" ? tiposIds.split(",").filter(Boolean) : [];

    if (ids.length === 0) {
      return res.status(400).json({ error: "tiposIds é obrigatório" });
    }

    const service = new RelatorioSecretariaService();
    const ordens = await service.execute({
      tiposIds: ids,
      startDate: startDate as string | undefined,
      endDate: endDate as string | undefined,
    });

    return res.json(ordens);
  }
}

export { RelatorioSecretariaController };
