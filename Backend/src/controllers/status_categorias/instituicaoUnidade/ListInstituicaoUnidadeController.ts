import { Response, Request } from "express";
import { ListInstituicaoUnidadeService } from "../../../services/status_categorias/instituicaoUnidade/ListInstituicaoUnidadeService";

class ListInstituicaoUnidadeController {
  constructor(private service: ListInstituicaoUnidadeService = new ListInstituicaoUnidadeService()) {}

  handle = async (req: Request, res: Response) => {
    const { instituicoes, total } = await this.service.execute();

    return res.json({
      instituicoes,
      total,
    });
  }
}

export { ListInstituicaoUnidadeController };
