import { Request, Response } from "express";
import { ListControledeLaboratorioService } from "../../../services/controles_forms/ControledeLaboratorio/ListControledeLaboratorioService";

class ListControledeLaboratorioController {
  constructor(private service: ListControledeLaboratorioService = new ListControledeLaboratorioService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total, totalAguardandoConserto, totalAguardandoDevolucao, totalAguardandoOSdeLaboratorio } =
      await this.service.execute();

    return res.json({
      controles,
      total,
      totalAguardandoConserto,
      totalAguardandoDevolucao,
      totalAguardandoOSdeLaboratorio,
    });
  }
}

export { ListControledeLaboratorioController };
