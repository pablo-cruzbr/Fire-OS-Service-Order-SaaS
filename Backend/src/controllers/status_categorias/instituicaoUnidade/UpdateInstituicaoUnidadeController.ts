import { Request, Response } from "express";
import { UpdateInstituicaoUnidadeService } from "../../../services/status_categorias/instituicaoUnidade/UpdateInstituicaoUnidadeService";
import { UpdateInstituicaoUnidadeInput } from "../../../schemas/instituicaoUnidade.schema";

class UpdateInstituicaoUnidadeController {
  constructor(
    private service: UpdateInstituicaoUnidadeService = new UpdateInstituicaoUnidadeService()
  ) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const instituicao = await this.service.execute(id, req.body as UpdateInstituicaoUnidadeInput);
    return res.json(instituicao);
  }
}

export { UpdateInstituicaoUnidadeController };
