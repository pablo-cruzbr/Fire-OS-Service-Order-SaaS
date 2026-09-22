import { Response, Request } from "express";
import { DetailLaudoTecnicoService } from "../../../services/controles_forms/ControledeLaudoTécnico/DetailControledeLaudoTenicoService";

class DetailLaudoTenicoController {
  constructor(private service: DetailLaudoTecnicoService = new DetailLaudoTecnicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailLaudoTenicoController };
