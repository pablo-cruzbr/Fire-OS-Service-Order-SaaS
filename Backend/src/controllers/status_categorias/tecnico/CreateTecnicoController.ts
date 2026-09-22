import { Request, Response } from "express";
import { CreateTecnicoService } from "../../../services/status_categorias/tecnico/CreateTecnicoService";
import { CreateTecnicoInput } from "../../../schemas/tecnico.schema";

class CreateTecnicoController {
  constructor(private service: CreateTecnicoService = new CreateTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const tecnico = await this.service.execute(req.body as CreateTecnicoInput);
    return res.json(tecnico);
  }
}

export { CreateTecnicoController };
