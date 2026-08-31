import { Request, Response } from "express";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import prismaClient from "../../../prisma";
import { UploadedFile } from "express-fileupload";
import { UpdateOrdemdeServicoInput } from "../../../schemas/ordemdeServico.schema";
import { ValidationError } from "../../../errors/AppError";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

class UpdateOrdemdeServicoService {
  async execute(id: string, body: UpdateOrdemdeServicoInput, file?: UploadedFile) {
    const updateData: any = {};
    let bannerassinaturaUrl: string | undefined;

    if (file) {
      const result: UploadApiResponse = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "ordens",
      });
      bannerassinaturaUrl = result.secure_url;
    } else if (body.assinatura && body.assinatura.startsWith("data:image")) {
      const result: UploadApiResponse = await cloudinary.uploader.upload(body.assinatura, {
        folder: "assinaturas_digitais",
      });
      bannerassinaturaUrl = result.secure_url;
    }

    if (bannerassinaturaUrl) {
      updateData.bannerassinatura = bannerassinaturaUrl;
    }

    if (body.nameTecnico !== undefined) updateData.nameTecnico = body.nameTecnico;
    if (body.diagnostico !== undefined) updateData.diagnostico = body.diagnostico;
    if (body.solucao !== undefined) updateData.solucao = body.solucao;
    if (body.assinante !== undefined) updateData.assinante = body.assinante;

    if (body.descricaodoProblemaouSolicitacao !== undefined) {
      updateData.descricaodoProblemaouSolicitacao = body.descricaodoProblemaouSolicitacao.trim();
    }

    if (body.duracao !== undefined) updateData.duracao = body.duracao;
    if (body.startedAt) updateData.startedAt = new Date(body.startedAt);
    if (body.endedAt) updateData.endedAt = new Date(body.endedAt);
    if (body.agendadoEm) updateData.agendadoEm = new Date(body.agendadoEm);

    const statusId = body.statusOrdemdeServico_id;
    if (statusId) {
      updateData.statusOrdemdeServico = { connect: { id: statusId } };
    }

    if (body.tecnico_id) updateData.tecnico = { connect: { id: body.tecnico_id } };
    if (body.tipodeChamado_id) updateData.tipodeChamado = { connect: { id: body.tipodeChamado_id } };
    if (body.tipodeOrdemdeServico_id) updateData.tipodeOrdemdeServico = { connect: { id: body.tipodeOrdemdeServico_id } };
    if (body.prioridade_id) updateData.prioridade = { connect: { id: body.prioridade_id } };
    if (body.equipamento_id) updateData.equipamento = { connect: { id: body.equipamento_id } };
    if (body.tarefa_id) updateData.tarefa = { connect: { id: body.tarefa_id } };
    if (body.informacoesSetorId) updateData.informacoesSetor = { connect: { id: body.informacoesSetorId } };
    if (body.cliente_id) updateData.cliente = { connect: { id: body.cliente_id } };
    if (body.instituicaoUnidade_id) updateData.instituicaoUnidade = { connect: { id: body.instituicaoUnidade_id } };

    if (body.atividades_ids) {
      let ids: string[];
      try {
        ids = JSON.parse(body.atividades_ids);
      } catch {
        throw new ValidationError("atividades_ids precisa ser um JSON válido.");
      }

      if (ids.length > 0) {
        updateData.atividades = {
          create: ids.map((idAtiv) => ({
            atividadePadrao: { connect: { id: idAtiv } },
          })),
        };
      }
    }

    return prismaClient.ordemdeServico.update({
      where: { id },
      data: updateData,
      include: {
        atividades: true,
        statusOrdemdeServico: true,
      },
    });
  }
}

class UpdateOrdemdeServicoController {
  async handle(req: Request, res: Response) {
    const { id } = req.params;
    const file = (req.files as any)?.file as UploadedFile | undefined;

    const service = new UpdateOrdemdeServicoService();
    const ordem = await service.execute(id, req.body as UpdateOrdemdeServicoInput, file);

    return res.json({
      message: "Ordem de Serviço updated com sucesso.",
      ordem,
    });
  }
}

export { UpdateOrdemdeServicoService, UpdateOrdemdeServicoController };
