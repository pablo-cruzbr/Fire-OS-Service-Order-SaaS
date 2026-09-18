import { Request, Response } from "express";
import { DeleteLookupCategoriaService } from "../../../services/status_categorias/DeleteLookupCategoriaService";
import { LookupCategoriaRepository } from "../../../repositories/LookupCategoriaRepository";

class RemoveStatusOrdemServicoController {
  constructor(
    private service: DeleteLookupCategoriaService = new DeleteLookupCategoriaService(
      new LookupCategoriaRepository("statusOrdemdeServico")
    )
  ) {}

  handle = async (req: Request, res: Response) => {
    const { statusOrdem_id } = req.query as { statusOrdem_id: string };
    const status = await this.service.execute(statusOrdem_id);
    return res.json(status);
  }
}

export { RemoveStatusOrdemServicoController };
