import { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { uploadQueue } from "../../../queue/uploadQueue";
import { ValidationError, NotFoundError } from "../../../errors/AppError";
import { FotoInput } from "../../../schemas/foto.schema";
import {
  FotoOrdemServicoRepository,
  fotoOrdemServicoRepository,
} from "../../../repositories/FotoOrdemServicoRepository";

class FotoOrdemServicoService {
  constructor(private repository: FotoOrdemServicoRepository = fotoOrdemServicoRepository) {}

  // Não sobe mais pro Cloudinary aqui dentro do request — só entrega um job
  // por foto pra fila e responde na hora. Quem sobe de verdade é o
  // uploadWorker.ts, rodando em outro processo (src/queue/uploadWorker.ts).
  async enfileirar(ordemdeServico_id: string, files: UploadedFile[]) {
    for (const file of files) {
      await uploadQueue.add("upload-foto-os", {
        ordemdeServico_id,
        tempFilePath: file.tempFilePath,
      });
    }
    return files.length;
  }

  listByOrdem(ordemdeServico_id: string) {
    return this.repository.findByOrdem(ordemdeServico_id);
  }

  async delete(id: string) {
    const foto = await this.repository.findById(id);
    if (!foto) {
      throw new NotFoundError("Foto não encontrada.");
    }

    const urlParts = foto.url.split("/");
    const fileName = urlParts[urlParts.length - 1];
    const publicId = "ordens_servico/" + fileName.split(".")[0];
    await cloudinary.uploader.destroy(publicId);

    await this.repository.delete(id);
    return { message: "Foto deletada com sucesso." };
  }
}

class fotoController {
  constructor(private service: FotoOrdemServicoService = new FotoOrdemServicoService()) {}

  handle = async (req: Request, res: Response) => {
    const { ordemdeServico_id } = req.body as FotoInput;

    if (!req.files || !("file" in req.files)) {
      throw new ValidationError("Arquivo não enviado ou campo 'file' ausente.");
    }

    const uploaded = req.files["file"];
    const files = Array.isArray(uploaded)
      ? (uploaded as unknown as UploadedFile[])
      : [uploaded as UploadedFile];

    const total = await this.service.enfileirar(ordemdeServico_id, files);

    return res.status(202).json({
      message: `${total} foto(s) recebida(s), processando em segundo plano.`,
    });
  }

  listByOrdem = async (req: Request, res: Response) => {
    const { id } = req.params;
    const fotos = await this.service.listByOrdem(id);
    return res.json(fotos);
  }

  delete = async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await this.service.delete(id);
    return res.json(result);
  }
}

export { fotoController, FotoOrdemServicoService };
