import { Request, Response } from "express";
import { UpdateControledeEstabilizadoresService } from "../../../services/controles_forms/ControledeEstabilizadores/UpdateControledeEstabilizadoresService";
import { UpdateEstabilizadoresInput } from "../../../schemas/estabilizadores.schema";

class UpdateControledeEstabilizadoresController {
  constructor(private service: UpdateControledeEstabilizadoresService = new UpdateControledeEstabilizadoresService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateEstabilizadoresInput);
    return res.json(result);
  }
}

export { UpdateControledeEstabilizadoresController };
