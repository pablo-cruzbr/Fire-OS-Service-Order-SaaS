import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const CREATE_INCLUDE = {
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
} satisfies Prisma.OrdemdeServicoInclude;

const UPDATE_INCLUDE = {
  atividades: true,
  statusOrdemdeServico: true,
} satisfies Prisma.OrdemdeServicoInclude;

// Isola as chamadas prismaClient.ordemdeServico.* num único lugar, pra o
// Service não precisar saber que existe um Prisma por trás — e pra testar
// o Service com um repository fake em vez de mockar o módulo do Prisma.
class OrdemdeServicoRepository {
  create(data: Prisma.OrdemdeServicoCreateInput) {
    return prismaClient.ordemdeServico.create({ data, include: CREATE_INCLUDE });
  }

  update(id: string, data: Prisma.OrdemdeServicoUpdateInput) {
    return prismaClient.ordemdeServico.update({ where: { id }, data, include: UPDATE_INCLUDE });
  }
}

const ordemdeServicoRepository = new OrdemdeServicoRepository();

export { OrdemdeServicoRepository, ordemdeServicoRepository };
