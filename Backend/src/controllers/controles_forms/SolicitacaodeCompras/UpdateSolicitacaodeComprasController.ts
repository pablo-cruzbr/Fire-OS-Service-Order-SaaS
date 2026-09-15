import { Request, Response } from "express";
import { UpdateSolicitacaodeComprasService } from "../../../services/controles_forms/SolicitacaodeCompras/UpdateSolicitacaodeComprasService";
import { UpdateSolicitacaoComprasInput } from "../../../schemas/solicitacaoCompras.schema";

class UpdateSolicitacaodeComprasController {
  constructor(private service: UpdateSolicitacaodeComprasService = new UpdateSolicitacaodeComprasService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateSolicitacaoComprasInput);
    return res.json(result);
  }
}

export { UpdateSolicitacaodeComprasController };
