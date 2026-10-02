import { Request, Response } from "express";
import { ListLookupCategoriaService } from "../../../services/status_categorias/ListLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";

class ListtipodeOrdemdeServicoController {
  constructor(
    private service: ListLookupCategoriaService = new ListLookupCategoriaService(
      new LookupCategoriaRepository("tipodeOrdemdeServico")
    )
  ) {}

  handle = async (req: Request, res: Response) => {
    const status = await this.service.execute();
    return res.json(status);
  }
}

export { ListtipodeOrdemdeServicoController };
