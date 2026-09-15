import { Response, Request } from "express";
import { CreateSolicitacaodeComprasService } from "../../../services/controles_forms/SolicitacaodeCompras/CreateSolicitacaodeComprasService";
import { CreateSolicitacaoComprasInput } from "../../../schemas/solicitacaoCompras.schema";

class CreateSolicitacaodeComprasController {
  constructor(private service: CreateSolicitacaodeComprasService = new CreateSolicitacaodeComprasService()) {}

  async handle(req: Request, res: Response) {
    const controle = await this.service.execute(req.body as CreateSolicitacaoComprasInput);
    return res.json(controle);
  }
}

export { CreateSolicitacaodeComprasController };
