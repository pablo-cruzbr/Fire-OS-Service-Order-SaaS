import { Response, Request } from "express";
import { ListEquipamentoService } from "../../../services/status_categorias/Equipamento/ListEquipamentoService";

class ListEquipamentoController {
  constructor(private service: ListEquipamentoService = new ListEquipamentoService()) {}

  handle = async (req: Request, res: Response) => {
    const equipamento = await this.service.execute();
    return res.json(equipamento);
  }
}

export {ListEquipamentoController}