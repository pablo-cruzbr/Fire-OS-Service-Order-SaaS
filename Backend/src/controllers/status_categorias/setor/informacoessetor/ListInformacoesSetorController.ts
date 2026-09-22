import { Response, Request } from "express";
import { ListInformacoesSetorService } from "../../../../services/status_categorias/Setor/InformacoesSetor/ListInformacoesSetorService";

class ListInformacaoesSetoresController {
  constructor(private service: ListInformacoesSetorService = new ListInformacoesSetorService()) {}

  handle = async (req: Request, res: Response) => {
    const setor = await this.service.execute();
    return res.json(setor);
  }
}

export {ListInformacaoesSetoresController}