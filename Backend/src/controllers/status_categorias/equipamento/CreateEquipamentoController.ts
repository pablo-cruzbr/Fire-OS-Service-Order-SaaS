import { Request, Response } from "express";
import { CreateEquipamentoService } from "../../../services/status_categorias/Equipamento/CreateEquipamentoService";
import { CreateEquipamentoInput } from "../../../schemas/equipamento.schema";

class CreateEquipamentoController {
  constructor(private service: CreateEquipamentoService = new CreateEquipamentoService()) {}

  async handle(req: Request, res: Response) {
    const equipamento = await this.service.execute(req.body as CreateEquipamentoInput);
    return res.json(equipamento);
  }
}

export { CreateEquipamentoController };
