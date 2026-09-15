import { Request, Response } from "express";
import { UpdateInformacoesSetorService } from "../../../../services/status_categorias/Setor/InformacoesSetor/UpdateInformacoesSetorService";
import { UpdateInformacoesSetorInput } from "../../../../schemas/informacoesSetor.schema";

class UpdateInformacoesSetorController {
  constructor(private service: UpdateInformacoesSetorService = new UpdateInformacoesSetorService()) {}

  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const setorInfo = await this.service.execute(id, req.body as UpdateInformacoesSetorInput);
    return res.json(setorInfo);
  }
}

export { UpdateInformacoesSetorController };
