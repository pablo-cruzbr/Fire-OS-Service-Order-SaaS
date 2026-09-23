import { Request, Response } from "express";
import { ListControledeMaquinasPendentesOroService } from "../../../services/controles_forms/ControledeMaquinasPendentesOro/ListControledeMaquinasPendentesOroService";

class ListControledeMaquinasPendentesOroController {
  constructor(private service: ListControledeMaquinasPendentesOroService = new ListControledeMaquinasPendentesOroService()) {}

  handle = async (req: Request, res: Response) => {
    const { controles, total, totalAguardandoRetirada, totalDescartada, totalDisponivel, totalEmManutencao, totalInstalada } =
      await this.service.execute();

    return res.json({
      controles,
      total,
      totalAguardandoRetirada,
      totalDescartada,
      totalDisponivel,
      totalEmManutencao,
      totalInstalada,
    });
  }
}

export { ListControledeMaquinasPendentesOroController };
