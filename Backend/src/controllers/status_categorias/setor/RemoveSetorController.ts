import { Request, Response } from "express";
import { RemoveSetorService } from "../../../services/status_categorias/Setor/RemoveSetorService";

class RemoveSetorController {
  constructor(private service: RemoveSetorService = new RemoveSetorService()) {}

  handle = async (req: Request, res: Response) => {
    const { setor_id } = req.query as { setor_id: string };
    const setor = await this.service.execute(setor_id);
    return res.json(setor);
  }
}

export { RemoveSetorController };
