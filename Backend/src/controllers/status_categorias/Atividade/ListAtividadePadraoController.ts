import { Request, Response } from 'express';
import { ListAtividadePadraoService } from '../../../services/status_categorias/Atividade/ListAtividadeService';
import { ListAtividadeQuery } from '../../../schemas/atividade.schema';

class ListAtividadePadraoController {
  constructor(private service: ListAtividadePadraoService = new ListAtividadePadraoService()) {}

  handle = async (req: Request, res: Response) => {
    const atividades = await this.service.execute(req.query as ListAtividadeQuery);
    return res.json(atividades);
  }
}

export { ListAtividadePadraoController };
