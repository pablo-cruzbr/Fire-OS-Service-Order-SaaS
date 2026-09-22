import { Request, Response } from "express";
import { ListControledeEstabilizadoresService } from "../../../services/controles_forms/ControledeEstabilizadores/ListControledeEstabilizadoresService";

class ListControledeEstabilizadoresController {
  constructor(private service: ListControledeEstabilizadoresService = new ListControledeEstabilizadoresService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total, totalAguardandoReparo, totalFinalizado } = await this.service.execute();

    return res.json({
      controles,
      total,
      totalAguardandoReparo,
      totalFinalizado,
    });
  }
}

export { ListControledeEstabilizadoresController };
