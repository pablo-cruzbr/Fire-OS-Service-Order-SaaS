import { Request, Response } from "express";
import { ListControledeLaudoTecnicoService } from "../../../services/controles_forms/ControledeLaudoTécnico/ListControledeLaudoTecnicoService";

class ListControledeLaudoTecnicoController {
  constructor(private service: ListControledeLaudoTecnicoService = new ListControledeLaudoTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const result = await this.service.execute();
    return res.json(result);
  }
}

export { ListControledeLaudoTecnicoController };
