import { Response, Request } from "express";
import { DetailControledeMaquinasPendentesOroService } from "../../../services/controles_forms/ControledeMaquinasPendentesOro/DetailControledeMaquinasPendentesOroService";

class DetailControledeMaquinasPendentesOroController {
  constructor(private service: DetailControledeMaquinasPendentesOroService = new DetailControledeMaquinasPendentesOroService()) {}

  handle = async (req: Request, res: Response) => {
    const { controle_id } = req.query as { controle_id: string };
    const controle = await this.service.execute(controle_id);
    return res.json(controle);
  }
}

export { DetailControledeMaquinasPendentesOroController };
