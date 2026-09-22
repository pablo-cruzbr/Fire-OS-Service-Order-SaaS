import { Response, Request } from "express";
import { DetailAssistenciaTecnicaService } from "../../../services/controles_forms/ControledeAssistenciaTecnica/DetailControledeAssistenciaTecnicaService";

class DetailAssistenciaTecnicaController {
  constructor(private service: DetailAssistenciaTecnicaService = new DetailAssistenciaTecnicaService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailAssistenciaTecnicaController };
