import { Request, Response } from "express";
import { UpdateEquipamentoService } from "../../../services/status_categorias/Equipamento/UpdateEquipamentoService";
import { UpdateEquipamentoInput } from "../../../schemas/equipamento.schema";

class UpdateEquipamentoController {
  constructor(private service: UpdateEquipamentoService = new UpdateEquipamentoService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const equipamento = await this.service.execute(id, req.body as UpdateEquipamentoInput);
    return res.json(equipamento);
  }
}

export { UpdateEquipamentoController };
