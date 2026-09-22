import { Request, Response } from "express";
import { ListLookupCategoriaService } from "../../../services/status_categorias/ListLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";

class ListstatusReparoController {
  constructor(
    private service: ListLookupCategoriaService = new ListLookupCategoriaService(
      new LookupCategoriaRepository("statusReparo")
    )
  ) {}

  handle = async (req: Request, res: Response) => {
    const status = await this.service.execute();
    return res.json(status);
  }
}

export { ListstatusReparoController };
