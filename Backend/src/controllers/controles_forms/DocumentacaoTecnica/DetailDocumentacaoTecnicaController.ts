import { Response, Request } from "express";
import { DetailDocumentacaoTecnicaService } from "../../../services/controles_forms/DocumentacaoTecnica/DetailDocumentacaoTecnicaService";

class DetailDocumentacaoTecnicaController {
  constructor(private service: DetailDocumentacaoTecnicaService = new DetailDocumentacaoTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailDocumentacaoTecnicaController };
