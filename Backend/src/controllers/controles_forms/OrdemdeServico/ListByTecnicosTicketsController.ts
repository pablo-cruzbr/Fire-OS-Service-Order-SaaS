import { Request, Response } from "express";
import {
  OrdemdeServicoRepository,
  ordemdeServicoRepository,
} from "../../../repositories/OrdemdeServicoRepository";

class ListByTecnicosTicketsService {
  constructor(private repository: OrdemdeServicoRepository = ordemdeServicoRepository) {}

  execute(tecnico_id: string) {
    return this.repository.findByTecnico(tecnico_id);
  }
}

class ListByTecnicosTicketsController {
  constructor(private service: ListByTecnicosTicketsService = new ListByTecnicosTicketsService()) {}

  handle = async (req: Request, res: Response) => {
    const { tecnico_id } = req.query as { tecnico_id: string };
    const ordens = await this.service.execute(tecnico_id);
    return res.json(ordens);
  }
}

export { ListByTecnicosTicketsController, ListByTecnicosTicketsService };
