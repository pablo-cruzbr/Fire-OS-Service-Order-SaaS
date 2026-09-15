import { Request, Response } from "express";
import { DeleteControledeMaquinasPendentesLabService } from "../../../services/controles_forms/ControledeMaquinasPendentesLab/DeleteControledeMaquinasPendentesLabService";

class DeleteControledeMaquinasPendentesLabController {
  constructor(private service: DeleteControledeMaquinasPendentesLabService = new DeleteControledeMaquinasPendentesLabService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id);
    return res.json(result);
  }
}

export { DeleteControledeMaquinasPendentesLabController };
