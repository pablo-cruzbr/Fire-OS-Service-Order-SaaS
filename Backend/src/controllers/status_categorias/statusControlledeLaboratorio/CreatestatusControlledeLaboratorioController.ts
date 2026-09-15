import { Request, Response } from "express";
import { CreateLookupCategoriaService } from "../../../services/status_categorias/CreateLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";
import { CreateLookupCategoriaInput } from "../../../schemas/lookupCategoria.schema";

class CreatestatusControlledeLaboratorioController {
  constructor(
    private service: CreateLookupCategoriaService = new CreateLookupCategoriaService(
      new LookupCategoriaRepository("statusControledeLaboratorio")
    )
  ) {}

  // Antes era "hadle" (typo, mas coerente com o "new ...Controller().hadle"
  // em routes.ts — os dois lados combinavam, então funcionava). Corrigido
  // pro nome padrão junto com a rota, no mesmo commit.
  async handle(req: Request, res: Response) {
    const status = await this.service.execute(req.body as CreateLookupCategoriaInput);
    return res.json(status);
  }
}

export { CreatestatusControlledeLaboratorioController };
