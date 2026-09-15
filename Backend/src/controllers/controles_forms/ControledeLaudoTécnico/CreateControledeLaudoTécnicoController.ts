import { Response, Request } from "express";
import { CreateControledeLaudoTecnicoService } from "../../../services/controles_forms/ControledeLaudoTécnico/CreateControledeLaudoTécnicoService";
import { CreateLaudoTecnicoInput } from "../../../schemas/laudoTecnico.schema";

class CreateControledeLaudoTecnicoController {
  constructor(private service: CreateControledeLaudoTecnicoService = new CreateControledeLaudoTecnicoService()) {}

  async handle(req: Request, res: Response) {
    const controle = await this.service.execute(req.body as CreateLaudoTecnicoInput);
    return res.json(controle);
  }
}

export { CreateControledeLaudoTecnicoController };
