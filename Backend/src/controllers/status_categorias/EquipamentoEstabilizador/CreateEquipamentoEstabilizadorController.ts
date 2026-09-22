import { Request, Response } from "express";
import { CreateEquipamentoEstabilizadorService } from "../../../services/status_categorias/EquipamentoEstabilizador/CreateEquipamentoEstabilizadorService";
import { CreateEquipamentoEstabilizadorInput } from "../../../schemas/equipamentoEstabilizador.schema";

class CreateEquipamentoEstabilizadorController {
  constructor(private service: CreateEquipamentoEstabilizadorService = new CreateEquipamentoEstabilizadorService()) {}

  handle = async (req: Request, res: Response) => {
    const estabilizador = await this.service.execute(req.body as CreateEquipamentoEstabilizadorInput);
    return res.json(estabilizador);
  }
}

export { CreateEquipamentoEstabilizadorController };
