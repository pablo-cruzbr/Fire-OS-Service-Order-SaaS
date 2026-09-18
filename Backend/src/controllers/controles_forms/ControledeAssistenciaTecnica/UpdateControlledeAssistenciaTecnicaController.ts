import { Request, Response } from "express";
import { UpdateAssistenciaTecnicaService } from "../../../services/controles_forms/ControledeAssistenciaTecnica/UpdateAssistenciaTecnicaService";
import { UpdateAssistenciaTecnicaInput } from "../../../schemas/assistenciaTecnica.schema";

class UpdateAssistenciaTecnicaController {
  constructor(private service: UpdateAssistenciaTecnicaService = new UpdateAssistenciaTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateAssistenciaTecnicaInput);
    return res.json(result);
  }
}

export { UpdateAssistenciaTecnicaController };
