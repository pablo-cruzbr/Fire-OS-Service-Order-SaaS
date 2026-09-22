import { Request, Response } from "express";
import { CreateClienteService } from "../../../services/status_categorias/Cliente/CreateClienteService";
import { CreateClienteInput } from "../../../schemas/cliente.schema";

class CreateClienteController {
  constructor(private service: CreateClienteService = new CreateClienteService()) {}

  handle = async (req: Request, res: Response) => {
    const cliente = await this.service.execute(req.body as CreateClienteInput);
    return res.json(cliente);
  }
}

export { CreateClienteController };
