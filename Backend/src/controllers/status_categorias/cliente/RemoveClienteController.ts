import { Request, Response } from "express";
import { RemoveClienteService } from "../../../services/status_categorias/Cliente/RemoveClienteService";

class RemoveClienteController {
  constructor(private service: RemoveClienteService = new RemoveClienteService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cliente = await this.service.execute(id);
    return res.json(cliente);
  }
}

export { RemoveClienteController };
