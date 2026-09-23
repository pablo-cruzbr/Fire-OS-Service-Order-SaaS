import { Request, Response } from "express";
import { CreateInstituicaoUnidadeService } from "../../../services/status_categorias/instituicaoUnidade/CreateInstituicaoUnidadeService";
import { CreateInstituicaoUnidadeInput } from "../../../schemas/instituicaoUnidade.schema";

class CreateInstituicaoUnidadeController {
  constructor(private service: CreateInstituicaoUnidadeService = new CreateInstituicaoUnidadeService()) {}

  handle = async (req: Request, res: Response) => {
    const instituicao = await this.service.execute(req.body as CreateInstituicaoUnidadeInput);
    return res.json(instituicao);
  }
}

export { CreateInstituicaoUnidadeController };
