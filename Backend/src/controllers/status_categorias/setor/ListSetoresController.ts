import { Request, Response } from "express";
import { ListSetoresService } from "../../../services/status_categorias/Setor/ListSetoresService";

class ListSetoresController {
  constructor(private service: ListSetoresService = new ListSetoresService()) {}

  handle = async (req: Request, res: Response) => {
    const setor = await this.service.execute();
    return res.json(setor);
  }
}

export { ListSetoresController };
