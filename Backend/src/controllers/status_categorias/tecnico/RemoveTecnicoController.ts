import { Request, Response } from "express";
import { RemoveTecnicoService } from "../../../services/status_categorias/tecnico/RemoveTecnicoService";

class RemoveTecnicoController {
  constructor(private service: RemoveTecnicoService = new RemoveTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const tecnico = await this.service.execute(id);
    return res.json(tecnico);
  }
}

export { RemoveTecnicoController };
