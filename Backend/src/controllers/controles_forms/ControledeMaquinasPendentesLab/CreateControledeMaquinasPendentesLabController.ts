import { Response, Request } from "express";
import { CreateControledeMaquinasPendentesLabService } from "../../../services/controles_forms/ControledeMaquinasPendentesLab/CreateControledeMaquinasPendentesLabService";
import { CreateMaquinasPendentesLabInput } from "../../../schemas/maquinasPendentesLab.schema";

class CreateControledeMaquinasPendentesLabController {
  constructor(private service: CreateControledeMaquinasPendentesLabService = new CreateControledeMaquinasPendentesLabService()) {}

  async handle(req: Request, res: Response) {
    const controle = await this.service.execute(req.body as CreateMaquinasPendentesLabInput);
    return res.json(controle);
  }
}

export { CreateControledeMaquinasPendentesLabController };
