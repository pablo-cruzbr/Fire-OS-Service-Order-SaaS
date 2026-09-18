import { Request, Response } from "express";
import { UpdateControledeMaquinasPendentesOroService } from "../../../services/controles_forms/ControledeMaquinasPendentesOro/UpdateControledeMaquinasPendentesOroService";
import { UpdateMaquinasPendentesOroInput } from "../../../schemas/maquinasPendentesOro.schema";

class UpdateControledeMaquinasPendentesOroController {
  constructor(private service: UpdateControledeMaquinasPendentesOroService = new UpdateControledeMaquinasPendentesOroService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateMaquinasPendentesOroInput);
    return res.json(result);
  }
}

export { UpdateControledeMaquinasPendentesOroController };
