import { Response, Request } from "express";
import { DetailMaquinasPendentesLabService } from "../../../services/controles_forms/ControledeMaquinasPendentesLab/DetailMaquinasPendentesLabService";

class DetailMaquinasPendentesLabController {
  constructor(private service: DetailMaquinasPendentesLabService = new DetailMaquinasPendentesLabService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailMaquinasPendentesLabController };
