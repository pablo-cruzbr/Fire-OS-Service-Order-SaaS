import { Request, Response } from "express";
import { RelatorioSecretariaService } from "../../../services/controles_forms/OrdemdeServico/RelatorioSecretariaService";
import { RelatorioSecretariaQuery } from "../../../schemas/ordemdeServico.schema";

class RelatorioSecretariaController {
  constructor(private service: RelatorioSecretariaService = new RelatorioSecretariaService()) {}

  handle = async (req: Request, res: Response) => {
    const ordens = await this.service.execute(req.query as unknown as RelatorioSecretariaQuery);
    return res.json(ordens);
  }
}

export { RelatorioSecretariaController };
