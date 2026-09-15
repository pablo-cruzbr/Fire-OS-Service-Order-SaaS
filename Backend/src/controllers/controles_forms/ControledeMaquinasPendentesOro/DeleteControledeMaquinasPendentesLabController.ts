import { Request, Response } from "express";
import { DeleteControledeMaquinasPendentesOroService } from "../../../services/controles_forms/ControledeMaquinasPendentesOro/DeleteControledeMaquinasPendentesOroService";

class DeleteControledeMaquinasPendentesOroController {
  constructor(private service: DeleteControledeMaquinasPendentesOroService = new DeleteControledeMaquinasPendentesOroService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteControledeMaquinasPendentesOroController };
