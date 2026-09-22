import { Request, Response } from "express";
import { ListTecnicoService } from "../../../services/status_categorias/tecnico/ListTecnicoService";

class ListTecnicoController {
  constructor(private service: ListTecnicoService = new ListTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total } = await this.service.execute();
    return res.json({ controles, total });
  }
}

export { ListTecnicoController };
