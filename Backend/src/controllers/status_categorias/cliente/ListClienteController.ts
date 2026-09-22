import { Request, Response } from "express";
import { ListClienteService } from "../../../services/status_categorias/Cliente/ListClienteService";

class ListClienteController {
  constructor(private service: ListClienteService = new ListClienteService()) {}

  handle = async (req: Request, res: Response) => {
    const { cliente, total } = await this.service.execute();
    return res.json({ controles: cliente, total });
  }
}

export { ListClienteController };
