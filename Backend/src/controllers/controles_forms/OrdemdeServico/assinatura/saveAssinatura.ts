import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { NotFoundError } from "../../../../errors/AppError";
import { AssinaturaInput } from "../../../../schemas/ordemdeServico.schema";
import {
  OrdemdeServicoRepository,
  ordemdeServicoRepository,
} from "../../../../repositories/OrdemdeServicoRepository";

class AssinaturaService {
  constructor(private repository: OrdemdeServicoRepository = ordemdeServicoRepository) {}

  async atualizar(ordemId: string, assinaturaBase64: string) {
    const existe = await this.repository.existsById(ordemId);
    if (!existe) {
      throw new NotFoundError("Ordem de Serviço não encontrada.");
    }

    const uploadResult = await cloudinary.uploader.upload(assinaturaBase64, {
      folder: "assinaturas_ordem",
      format: "jpg",
    });

    const ordem = await this.repository.updateAssinatura(ordemId, uploadResult.secure_url);
    return ordem.assinaturaDigital;
  }

  async buscar(ordemId: string) {
    const ordem = await this.repository.findAssinatura(ordemId);
    if (!ordem) {
      throw new NotFoundError("Ordem de Serviço não encontrada.");
    }

    return ordem.assinaturaDigital;
  }
}

class AssinaturaController {
  constructor(private service: AssinaturaService = new AssinaturaService()) {}

  atualizar = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { assinaturaBase64 } = req.body as AssinaturaInput;

    const assinatura = await this.service.atualizar(id, assinaturaBase64);
    return res.json({ assinatura });
  }

  buscar = async (req: Request, res: Response) => {
    const { ordemId } = req.params;
    const assinatura = await this.service.buscar(ordemId);
    return res.json({ assinatura: assinatura || null });
  }
}

export { AssinaturaController, AssinaturaService };
