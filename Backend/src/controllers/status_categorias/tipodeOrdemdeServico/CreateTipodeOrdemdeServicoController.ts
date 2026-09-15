import { Request, Response } from "express";
import { CreateLookupCategoriaService } from "../../../services/status_categorias/CreateLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";
import { CreateLookupCategoriaInput } from "../../../schemas/lookupCategoria.schema";

class CreatetipodeOrdemdeServicoController {
  constructor(
    private service: CreateLookupCategoriaService = new CreateLookupCategoriaService(
      new LookupCategoriaRepository("tipodeOrdemdeServico")
    )
  ) {}

  async handle(req: Request, res: Response) {
    const status = await this.service.execute(req.body as CreateLookupCategoriaInput);
    return res.json(status);
  }
}

export { CreatetipodeOrdemdeServicoController };
