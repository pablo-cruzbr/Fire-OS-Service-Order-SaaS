import { Request, Response } from "express";
import { UpdateControledeMaquinasPendentesLabService } from "../../../services/controles_forms/ControledeMaquinasPendentesLab/UpdateControledeMaquinasPendentesLabService";
import { UpdateMaquinasPendentesLabInput } from "../../../schemas/maquinasPendentesLab.schema";

class UpdateControledeMaquinasPendentesLabController {
  constructor(private service: UpdateControledeMaquinasPendentesLabService = new UpdateControledeMaquinasPendentesLabService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.execute(id, req.body as UpdateMaquinasPendentesLabInput);
    return res.json(result);
  }
}

export { UpdateControledeMaquinasPendentesLabController };
