import { Request, Response } from "express";
import prismaClient from "../../../prisma";
import { v2 as cloudinary } from "cloudinary";
import { UploadedFile } from "express-fileupload";
import { uploadQueue } from "../../../queue/uploadQueue";

export class fotoController {
  async handle(req: Request, res: Response) {
    try {
      const { ordemdeServico_id } = req.body;

      const debugInfo = {
        receivedHeaders: req.headers["content-type"], 
        hasFiles: !!req.files,
        fileKeys: req.files ? Object.keys(req.files) : [], 
        bodyKeys: Object.keys(req.body), 
        bodyValues: req.body
        };

      if (!req.files || !("file" in req.files)) {
        console.log("-> Erro de diagnóstico:", debugInfo);
        return res.status(400).json({ 
          error: "Arquivo não enviado ou campo 'file' ausente.",
          diagnostico: {
            orientacao: "Certifique-se de que o campo no Insomnia se chama exatamente 'file' e é do tipo File.",
            dadosRecebidos: debugInfo
          }
        });
      }

      if (!ordemdeServico_id) {
        return res.status(400).json({ error: "ID da ordem de serviço é obrigatório." });
      }

      const uploaded = req.files["file"];
      const files = Array.isArray(uploaded)
        ? (uploaded as unknown as UploadedFile[])
        : [uploaded as UploadedFile];

      // Não sobe mais pro Cloudinary aqui dentro do request — só entrega um
      // job por foto pra fila e responde na hora. Quem sobe de verdade é o
      // uploadWorker.ts, rodando em outro processo (src/queue/uploadWorker.ts).
      for (const file of files) {
        await uploadQueue.add("upload-foto-os", {
          ordemdeServico_id,
          tempFilePath: file.tempFilePath,
        });
      }

      return res.status(202).json({
        message: `${files.length} foto(s) recebida(s), processando em segundo plano.`,
      });

    } catch (error: any) {
      console.error("-> Erro durante a requisição:", error);
      return res.status(400).json({ error: error.message });
    }
  }

  async listByOrdem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fotos = await prismaClient.fotoOrdemServico.findMany({
        where: { ordemdeServico_id: id },
        orderBy: { created_at: "desc" },
      });
      return res.json(fotos);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const foto = await prismaClient.fotoOrdemServico.findUnique({
        where: { id },
      });

      if (!foto) {
        return res.status(404).json({ error: "Foto não encontrada." });
      }

      const urlParts = foto.url.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const publicId = "ordens_servico/" + fileName.split(".")[0];

      await cloudinary.uploader.destroy(publicId);

      await prismaClient.fotoOrdemServico.delete({
        where: { id },
      });

      return res.json({ message: "Foto deletada com sucesso." });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
}