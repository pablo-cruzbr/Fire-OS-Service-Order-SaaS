import { Request, Response } from "express";
import { CreateLookupCategoriaService } from "../../../services/status_categorias/CreateLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";
import { CreateLookupCategoriaInput } from "../../../schemas/lookupCategoria.schema";

class CreateStatusUrgenciaController {
  constructor(
    private service: CreateLookupCategoriaService = new CreateLookupCategoriaService(
      new LookupCategoriaRepository("prioridade")
    )
  ) {}

  handle = async (req: Request, res: Response) => {
    const category = await this.service.execute(req.body as CreateLookupCategoriaInput);
    return res.json(category);
  }
}

export { CreateStatusUrgenciaController };
