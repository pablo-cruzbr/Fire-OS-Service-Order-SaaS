import { Request, Response } from "express";
import { ListDocumentacaoTecnicaService } from "../../../services/controles_forms/DocumentacaoTecnica/ListDocumentacaoTecnicaService";

class ListDocumentacaoTecnicaController {
  constructor(private service: ListDocumentacaoTecnicaService = new ListDocumentacaoTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const result = await this.service.execute();
    return res.json(result);
  }
}

export {ListDocumentacaoTecnicaController}