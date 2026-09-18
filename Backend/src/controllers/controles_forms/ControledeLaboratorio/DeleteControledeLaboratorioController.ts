import { Request, Response } from "express";
import { DeleteControledeLaboratorioService } from "../../../services/controles_forms/ControledeLaboratorio/DeleteControledeLaboratorioService";

class DeleteControledeLaboratorioController {
  constructor(private service: DeleteControledeLaboratorioService = new DeleteControledeLaboratorioService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteControledeLaboratorioController };
