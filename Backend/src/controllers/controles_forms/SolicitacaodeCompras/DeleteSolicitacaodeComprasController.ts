import { Request, Response } from "express";
import { DeleteSolicitacaodeComprasService } from "../../../services/controles_forms/SolicitacaodeCompras/DeleteSolicitacaodeComprasService";

class DeleteSolicitacaodeComprasController {
  constructor(private service: DeleteSolicitacaodeComprasService = new DeleteSolicitacaodeComprasService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteSolicitacaodeComprasController };
