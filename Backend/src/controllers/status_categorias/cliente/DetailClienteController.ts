import { Request, Response } from "express";
import { DetailClienteService } from "../../../services/status_categorias/Cliente/DetailClienteService";

class DetailClienteController {
  constructor(private service: DetailClienteService = new DetailClienteService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const cliente = await this.service.execute(controle_id);
    return res.json(cliente);
  }
}

export { DetailClienteController };
