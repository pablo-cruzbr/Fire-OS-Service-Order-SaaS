import { Request, Response } from "express";
import { ListOrdemdeServicoService } from "../../../services/controles_forms/OrdemdeServico/ListOrdemdeServicoService";
import { ListOrdemdeServicoQuery } from "../../../schemas/ordemdeServico.schema";

class ListOrdemdeServicoController {
  constructor(private service: ListOrdemdeServicoService = new ListOrdemdeServicoService()) {}

  handle = async (req: Request, res: Response) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const user_id = req.user_id as string;
    const query = req.query as unknown as ListOrdemdeServicoQuery;

    const result = await this.service.execute({ user_id, ...query });

    return res.json(result);
  }
}

export { ListOrdemdeServicoController };
