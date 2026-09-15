import { Response, Request } from "express";
import { CreateControledeLaboratorioService } from "../../../services/controles_forms/ControledeLaboratorio/CreateControledeLaboratorioService";
import { CreateLaboratorioInput } from "../../../schemas/laboratorio.schema";

class CreateControledeLaboratorioController {
  constructor(private service: CreateControledeLaboratorioService = new CreateControledeLaboratorioService()) {}

  async handle(req: Request, res: Response) {
    const controle = await this.service.execute(req.body as CreateLaboratorioInput);
    return res.json(controle);
  }
}

export { CreateControledeLaboratorioController };
