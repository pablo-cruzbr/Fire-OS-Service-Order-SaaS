import { Request, Response } from "express";
import { CreateSetorService } from "../../../services/status_categorias/Setor/CreateSetorService";
import { CreateSetorInput } from "../../../schemas/setor.schema";

class CreateSetorController {
  constructor(private service: CreateSetorService = new CreateSetorService()) {}

  handle = async (req: Request, res: Response) => {
    const setor = await this.service.execute(req.body as CreateSetorInput);
    return res.json(setor);
  }
}

export { CreateSetorController };
