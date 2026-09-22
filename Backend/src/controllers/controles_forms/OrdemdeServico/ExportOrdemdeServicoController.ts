import { Request, Response } from "express";
import { ExportOrdemdeServicoService } from "../../../services/controles_forms/OrdemdeServico/ExportOrdemdeServicoService";
import { ExportOrdemdeServicoQuery } from "../../../schemas/ordemdeServico.schema";

class ExportOrdemdeServicoController {
  constructor(private service: ExportOrdemdeServicoService = new ExportOrdemdeServicoService()) {}

  handle = async (req: Request, res: Response) => {
    const user_id = req.user_id as string;
    const workbook = await this.service.buildWorkbook(user_id, req.query as ExportOrdemdeServicoQuery);

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.setHeader("Surrogate-Control", "no-store");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=Relatorio_OS_${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.status(200).end();
  }
}

export { ExportOrdemdeServicoController };
