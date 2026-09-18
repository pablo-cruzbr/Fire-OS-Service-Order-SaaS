import { Response, Request } from "express";
import { CreateControledeEstabilizadoresService } from "../../../services/controles_forms/ControledeEstabilizadores/CreateControledeEstabilizadoresService";
import { CreateEstabilizadoresInput } from "../../../schemas/estabilizadores.schema";

class CreateControledeEstabilizadoresController {
  constructor(private service: CreateControledeEstabilizadoresService = new CreateControledeEstabilizadoresService()) {}

  handle = async (req: Request, res: Response) => {
    const controle = await this.service.execute(req.body as CreateEstabilizadoresInput);
    return res.json(controle);
  }
}

export { CreateControledeEstabilizadoresController };
