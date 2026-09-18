import { Response, Request } from "express";
import { CreateControledeAssistenciaTecnicaService } from "../../../services/controles_forms/ControledeAssistenciaTecnica/CreateControledeAssistenciaTecnicaService";
import { CreateAssistenciaTecnicaInput } from "../../../schemas/assistenciaTecnica.schema";

class CreateControledeAssistenciaTecnicaController {
  constructor(private service: CreateControledeAssistenciaTecnicaService = new CreateControledeAssistenciaTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const controle = await this.service.execute(req.body as CreateAssistenciaTecnicaInput);
    return res.json(controle);
  }
}

export { CreateControledeAssistenciaTecnicaController };
