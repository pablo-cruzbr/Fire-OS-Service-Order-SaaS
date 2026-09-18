import { Request, Response } from "express";
import { DeleteControledeLaudoTecnicoService } from "../../../services/controles_forms/ControledeLaudoTécnico/DeleteControledeLaudoTenicoService";

class DeleteControledeLaudoTecnicoController {
  constructor(private service: DeleteControledeLaudoTecnicoService = new DeleteControledeLaudoTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteControledeLaudoTecnicoController };
