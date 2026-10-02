import { Request, Response } from "express";
import { ListLookupCategoriaService } from "../../../services/status_categorias/ListLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";

class ListStatusComprasController {
  constructor(
    private service: ListLookupCategoriaService = new ListLookupCategoriaService(
      new LookupCategoriaRepository("statusCompras")
    )
  ) {}

  handle = async (req: Request, res: Response) => {
    const status = await this.service.execute();
    return res.json(status);
  }
}

export { ListStatusComprasController };
