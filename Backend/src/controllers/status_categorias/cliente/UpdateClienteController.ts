import { Request, Response } from "express";
import { UpdateClienteService } from "../../../services/status_categorias/Cliente/UpdateClienteService";
import { UpdateClienteInput } from "../../../schemas/cliente.schema";

class UpdateClienteController {
  constructor(private service: UpdateClienteService = new UpdateClienteService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const cliente = await this.service.execute(id, req.body as UpdateClienteInput);
    return res.json(cliente);
  }
}

export { UpdateClienteController };
