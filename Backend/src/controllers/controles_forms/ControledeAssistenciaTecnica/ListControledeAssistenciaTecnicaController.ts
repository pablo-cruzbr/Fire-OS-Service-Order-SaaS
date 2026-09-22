import { Request, Response } from "express";
import { ListControledeAssistenciaTecnicaService } from "../../../services/controles_forms/ControledeAssistenciaTecnica/ListControledeAssistenciaTecnicaService";

class ListControledeAssistenciaTecnicaController {
  constructor(private service: ListControledeAssistenciaTecnicaService = new ListControledeAssistenciaTecnicaService()) {}

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

export { ListControledeAssistenciaTecnicaController };
