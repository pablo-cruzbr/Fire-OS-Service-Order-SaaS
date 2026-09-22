import { Response, Request } from "express";
import { DetailComprasService } from "../../../services/controles_forms/SolicitacaodeCompras/DetailSolicitacaodeComprasService";

class DetailComprasController {
  constructor(private service: DetailComprasService = new DetailComprasService()) {}

  handle = async (req: Request, res: Response) => {
    const { compra_id } = req.query as { compra_id: string };
    const controle = await this.service.execute(compra_id);
    return res.json(controle);
  }
}

export { DetailComprasController };
