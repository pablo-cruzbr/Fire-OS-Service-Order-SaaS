import { Request, Response } from "express";
import { ListSolicitacaodeComprasService } from "../../../services/controles_forms/SolicitacaodeCompras/ListSolicitacaodeComprasService";

class ListSolicitacaodeComprasController {
  constructor(private service: ListSolicitacaodeComprasService = new ListSolicitacaodeComprasService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total, totalAguardandoCompra, totalAguardandoEntrega, totalCompraFinalizada } =
      await this.service.execute();

    return res.json({
      controles,
      total,
      totalAguardandoCompra,
      totalAguardandoEntrega,
      totalCompraFinalizada,
    });
  }
}

export { ListSolicitacaodeComprasController };
