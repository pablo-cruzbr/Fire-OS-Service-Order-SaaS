import { Request, Response } from "express";
import { UpdateDocumentacaoTecnicaService } from "../../../services/controles_forms/DocumentacaoTecnica/UpdateDocumentacaoTecnicaService";
import { UpdateDocumentacaoTecnicaInput } from "../../../schemas/documentacaoTecnica.schema";

class UpdateDocumentacaoTecnicaController {
  constructor(private service: UpdateDocumentacaoTecnicaService = new UpdateDocumentacaoTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateDocumentacaoTecnicaInput);
    return res.json(result);
  }
}

export { UpdateDocumentacaoTecnicaController };
