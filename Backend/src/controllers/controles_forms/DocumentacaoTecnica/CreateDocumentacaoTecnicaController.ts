import { Response, Request } from "express";
import { CreateDocumentacaoTecnicaService } from "../../../services/controles_forms/DocumentacaoTecnica/CreateDocumentacaoTecnicaService";
import { CreateDocumentacaoTecnicaInput } from "../../../schemas/documentacaoTecnica.schema";

class CreateDocumentacaoTecnicaController {
  constructor(private service: CreateDocumentacaoTecnicaService = new CreateDocumentacaoTecnicaService()) {}

  async handle(req: Request, res: Response) {
    const controle = await this.service.execute(req.body as CreateDocumentacaoTecnicaInput);
    return res.json(controle);
  }
}

export { CreateDocumentacaoTecnicaController };
