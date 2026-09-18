import { Response, Request } from "express";
import { CreateControledeMaquinasPendentesOroService } from "../../../services/controles_forms/ControledeMaquinasPendentesOro/CreateControledeMaquinasPendentesOroService";
import { CreateMaquinasPendentesOroInput } from "../../../schemas/maquinasPendentesOro.schema";

class CreateControledeMaquinasPendentesOroController {
  constructor(private service: CreateControledeMaquinasPendentesOroService = new CreateControledeMaquinasPendentesOroService()) {}

  handle = async (req: Request, res: Response) => {
    const controle = await this.service.execute(req.body as CreateMaquinasPendentesOroInput);
    return res.json(controle);
  }
}

export { CreateControledeMaquinasPendentesOroController };
