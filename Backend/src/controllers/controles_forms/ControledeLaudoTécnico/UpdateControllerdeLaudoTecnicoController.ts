import { Request, Response } from "express";
import { UpdateControledeLaudoTecnicoService } from "../../../services/controles_forms/ControledeLaudoTécnico/UpdateControledeLaudoTecnicoService";
import { UpdateLaudoTecnicoInput } from "../../../schemas/laudoTecnico.schema";

class UpdateControllerdeLaudoTecnicoController {
  constructor(private service: UpdateControledeLaudoTecnicoService = new UpdateControledeLaudoTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateLaudoTecnicoInput);
    return res.json(result);
  }
}

export { UpdateControllerdeLaudoTecnicoController };
