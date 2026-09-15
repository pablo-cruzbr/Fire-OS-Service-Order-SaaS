import { Request, Response } from "express";
import { RemoveEquipamentoService } from "../../../services/status_categorias/Equipamento/RemoveEquipamentoService";

class RemoveEquipamentoController {
  constructor(private service: RemoveEquipamentoService = new RemoveEquipamentoService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const equipamento = await this.service.execute(id);
    return res.json(equipamento);
  }
}

export { RemoveEquipamentoController };
