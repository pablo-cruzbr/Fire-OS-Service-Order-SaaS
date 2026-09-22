import { Request, Response } from "express";
import {
  OrdemdeServicoRepository,
  ordemdeServicoRepository,
} from "../../../repositories/OrdemdeServicoRepository";

class ListByStatusTicketsService {
  constructor(private repository: OrdemdeServicoRepository = ordemdeServicoRepository) {}

  execute(statusOrdemdeServico_id: string) {
    return this.repository.findByStatus(statusOrdemdeServico_id);
  }
}

class ListByStatusTicketsController {
  constructor(private service: ListByStatusTicketsService = new ListByStatusTicketsService()) {}

  handle = async (req: Request, res: Response) => {
    const { statusOrdemdeServico_id } = req.query as { statusOrdemdeServico_id: string };
    const ordens = await this.service.execute(statusOrdemdeServico_id);
    return res.json(ordens);
  }
}

export { ListByStatusTicketsController, ListByStatusTicketsService };
