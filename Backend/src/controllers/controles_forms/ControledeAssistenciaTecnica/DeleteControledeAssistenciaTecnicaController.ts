import { Request, Response } from "express";
import { DeleteControledeAssistenciaTecnicaService } from "../../../services/controles_forms/ControledeAssistenciaTecnica/DeleteControledeAssistenciaTecnicaService";

class DeleteControledeAssistenciaTecnicaController {
  constructor(private service: DeleteControledeAssistenciaTecnicaService = new DeleteControledeAssistenciaTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteControledeAssistenciaTecnicaController };
