import { Request, Response } from "express";
import { DeleteDocumentacaoTecnicaService } from "../../../services/controles_forms/DocumentacaoTecnica/DeleteDocumentacaoTecnicaService";

class DeleteDocumentacaoTecnicaController {
  constructor(private service: DeleteDocumentacaoTecnicaService = new DeleteDocumentacaoTecnicaService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteDocumentacaoTecnicaController };
