import { Request, Response } from "express";
import { ListControledeMaquinasPendentesLabService } from "../../../services/controles_forms/ControledeMaquinasPendentesLab/ListControledeMaquinasPendentesLabService";

class ListControledeMaquinasPendentesLabController {
  constructor(private service: ListControledeMaquinasPendentesLabService = new ListControledeMaquinasPendentesLabService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total, totalPendenteOro, totalSubstituta } = await this.service.execute();

    return res.json({
      controles,
      total,
      totalPendenteOro,
      totalSubstituta,
    });
  }
}

export { ListControledeMaquinasPendentesLabController };
