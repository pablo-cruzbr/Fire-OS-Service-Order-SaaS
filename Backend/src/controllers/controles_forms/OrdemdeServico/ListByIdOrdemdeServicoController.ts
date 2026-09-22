import { Request, Response } from "express";
import { NotFoundError } from "../../../errors/AppError";
import {
  OrdemdeServicoRepository,
  ordemdeServicoRepository,
} from "../../../repositories/OrdemdeServicoRepository";

class GetOrdemdeServicoByIdService {
  constructor(private repository: OrdemdeServicoRepository = ordemdeServicoRepository) {}

  async execute(id: string) {
    const ordem = await this.repository.findById(id);

    if (!ordem) {
      throw new NotFoundError("Ordem de Serviço não encontrada.");
    }

    return ordem;
  }
}

class GetOrdemdeServicoByIdController {
  constructor(private service: GetOrdemdeServicoByIdService = new GetOrdemdeServicoByIdService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const ordem = await this.service.execute(id);
    return res.json(ordem);
  }
}

export { GetOrdemdeServicoByIdController, GetOrdemdeServicoByIdService };
