import { Response, Request } from "express";
import { DetailControledeLaboratorioService } from "../../../services/controles_forms/ControledeLaboratorio/DetailControledeLaboratorioService";

class DetailControledeLaboratorioController {
  constructor(private service: DetailControledeLaboratorioService = new DetailControledeLaboratorioService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailControledeLaboratorioController };
