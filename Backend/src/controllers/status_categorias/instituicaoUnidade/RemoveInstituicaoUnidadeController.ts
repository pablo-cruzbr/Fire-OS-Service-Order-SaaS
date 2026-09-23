import { Request, Response } from "express";
import { RemoveInstituicaoUnidadeService } from "../../../services/status_categorias/instituicaoUnidade/RemoveInstituicaoUnidadeService";

class RemoveInstituicaoUnidadeController {
  constructor(private service: RemoveInstituicaoUnidadeService = new RemoveInstituicaoUnidadeService()) {}

  handle = async (req: Request, res: Response) => {
    const { instituicao_id } = req.query as { instituicao_id: string };
    const instituicao = await this.service.execute(instituicao_id);
    return res.json(instituicao);
  }
}

export { RemoveInstituicaoUnidadeController };
