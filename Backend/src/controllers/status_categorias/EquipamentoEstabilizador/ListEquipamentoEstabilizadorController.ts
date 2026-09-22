import { Request, Response } from "express";
import { ListEquipamentoEstabilizadorService } from "../../../services/status_categorias/EquipamentoEstabilizador/ListEquipamentoEstabilizadorService";

class ListEsquipamentoEstabilizadorController {
  constructor(private service: ListEquipamentoEstabilizadorService = new ListEquipamentoEstabilizadorService()) {}

  handle = async (req: Request, res: Response) => {
    const estabilizadores = await this.service.execute();
    return res.json(estabilizadores);
  }
}

export { ListEsquipamentoEstabilizadorController };
