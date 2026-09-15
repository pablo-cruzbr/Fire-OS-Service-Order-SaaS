import { Request, Response } from "express";
import { CreateInformacoesSetorService } from "../../../../services/status_categorias/Setor/InformacoesSetor/CreateInformacoesSetorService";
import { CreateInformacoesSetorInput } from "../../../../schemas/informacoesSetor.schema";

class CreateInformacoesSetorController {
  constructor(private service: CreateInformacoesSetorService = new CreateInformacoesSetorService()) {}

  async handle(req: Request, res: Response) {
    const setor = await this.service.execute(req.body as CreateInformacoesSetorInput);
    return res.json(setor);
  }
}

export { CreateInformacoesSetorController };
