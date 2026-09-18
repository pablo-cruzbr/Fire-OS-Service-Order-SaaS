import { Request, Response } from "express";
import { UpdateControledeLaboratorioService } from "../../../services/controles_forms/ControledeLaboratorio/UpdateControledeLaboratorioService";
import { UpdateLaboratorioInput } from "../../../schemas/laboratorio.schema";

class UpdateControledeLaboratorioController {
  constructor(private service: UpdateControledeLaboratorioService = new UpdateControledeLaboratorioService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateLaboratorioInput);
    return res.json(result);
  }
}

export { UpdateControledeLaboratorioController };
