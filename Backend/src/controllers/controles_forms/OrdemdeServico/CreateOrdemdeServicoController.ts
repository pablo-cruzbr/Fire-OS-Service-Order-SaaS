import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import prismaClient from "../../../prisma";
import { CreateOrdemdeServicoInput } from "../../../schemas/ordemdeServico.schema";

const STATUS_DEFAULT_ID = "80e14fbe-c7fd-45bc-b3cd-cfa51ede44e0";
const MAX_NUMERO_OS_ATTEMPTS = 5;

class CreateOrdemServicoService {
  async execute(data: CreateOrdemdeServicoInput) {
    for (let attempt = 1; attempt <= MAX_NUMERO_OS_ATTEMPTS; attempt++) {
      const numeroOS = Math.floor(10000 + Math.random() * 90000);

      try {
        return await prismaClient.ordemdeServico.create({
          data: {
            numeroOS,
            name: data.name,
            descricaodoProblemaouSolicitacao: data.descricaodoProblemaouSolicitacao,
            patrimoniodoequipamento: data.patrimoniodoequipamento,
            nomedoContatoaserProcuradonoLocal: data.nomedoContatoaserProcuradonoLocal || null,
            tipodeChamado: { connect: { id: data.tipodeChamado_id } },
            user: { connect: { id: data.user_id } },

            statusOrdemdeServico: {
              connect: { id: data.statusOrdemdeServico_id || STATUS_DEFAULT_ID },
            },

            cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
            instituicaoUnidade: data.instituicaoUnidade_id
              ? { connect: { id: data.instituicaoUnidade_id } }
              : undefined,
            tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
            tipodeOrdemdeServico: data.tipodeOrdemdeServico_id
              ? { connect: { id: data.tipodeOrdemdeServico_id } }
              : undefined,
            tarefa: data.tarefa_id ? { connect: { id: data.tarefa_id } } : undefined,
            prioridade: data.prioridade_id ? { connect: { id: data.prioridade_id } } : undefined,

            nameTecnico: data.nameTecnico || null,
            diagnostico: data.diagnostico || null,
            solucao: data.solucao,
            bannerassinatura: data.bannerassinatura || null,
            informacoesSetor: data.informacoesSetorId
              ? { connect: { id: data.informacoesSetorId } }
              : undefined,
          },
          include: {
            cliente: true,
            tecnico: true,
            tipodeChamado: true,
            statusOrdemdeServico: true,
            instituicaoUnidade: true,
            user: {
              include: {
                instituicaoUnidade: true,
                cliente: true,
              },
            },
            tipodeOrdemdeServico: true,
            informacoesSetor: {
              select: {
                id: true,
                usuario: true,
                ramal: true,
                andar: true,
                setor: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                instituicaoUnidade: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                cliente: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            tarefa: {
              select: { id: true, name: true },
            },
            prioridade: {
              select: { id: true, name: true },
            },
          },
        });
      } catch (error) {
        const isNumeroOSCollision =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002" &&
          (error.meta?.target as string[] | undefined)?.includes("numeroOS");

        if (isNumeroOSCollision && attempt < MAX_NUMERO_OS_ATTEMPTS) {
          continue;
        }

        throw error;
      }
    }

    throw new Error("Não foi possível gerar um número de OS único.");
  }
}

class CreateOrdemServicoController {
  async handle(req: Request, res: Response) {
    const service = new CreateOrdemServicoService();
    const ordem = await service.execute(req.body as CreateOrdemdeServicoInput);
    return res.json(ordem);
  }
}

export { CreateOrdemServicoController };
