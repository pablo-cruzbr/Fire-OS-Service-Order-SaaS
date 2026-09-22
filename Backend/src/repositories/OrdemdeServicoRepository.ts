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

const BY_ID_SELECT = {
  id: true,
  numeroOS: true,
  name: true,
  descricaodoProblemaouSolicitacao: true,
  patrimoniodoequipamento: true,
  nomedoContatoaserProcuradonoLocal: true,
  agendadoEm: true,
  created_at: true,
  updatedAt: true,
  nameTecnico: true,
  diagnostico: true,
  solucao: true,
  assinante: true,
  bannerassinatura: true,
  startedAt: true,
  endedAt: true,
  duracao: true,
  equipamento: {
    select: { id: true, name: true, patrimonio: true },
  },
  statusOrdemdeServico: {
    select: { id: true, name: true },
  },
  instituicaoUnidade: {
    select: { id: true, name: true, endereco: true },
  },
  informacoesSetor: {
    select: {
      id: true,
      usuario: true,
      ramal: true,
      andar: true,
      setor: { select: { id: true, name: true } },
      instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
      cliente: { select: { id: true, name: true, endereco: true, cnpj: true } },
    },
  },
  cliente: {
    select: { id: true, name: true, endereco: true },
  },
  tecnico: {
    select: { id: true, name: true },
  },
  tipodeChamado: {
    select: { id: true, name: true },
  },
  tipodeOrdemdeServico: {
    select: { id: true, name: true },
  },
  prioridade: {
    select: { id: true, name: true },
  },
  tarefa: {
    select: { id: true, name: true },
  },
  atividades: {
    select: {
      id: true,
      atividadePadrao: {
        select: { id: true, descricao: true, categoria: true },
      },
    },
  },
  user: {
    select: { id: true, name: true, email: true },
  },
} satisfies Prisma.OrdemdeServicoSelect;

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

  findById(id: string) {
    return prismaClient.ordemdeServico.findUnique({ where: { id }, select: BY_ID_SELECT });
  }

  findByStatus(statusOrdemdeServico_id: string) {
    return prismaClient.ordemdeServico.findMany({ where: { statusOrdemdeServico_id } });
  }

  findByTecnico(tecnico_id: string) {
    return prismaClient.ordemdeServico.findMany({ where: { tecnico_id } });
  }

  existsById(id: string) {
    return prismaClient.ordemdeServico
      .findUnique({ where: { id }, select: { id: true } })
      .then((ordem) => ordem !== null);
  }

  findAssinatura(id: string) {
    return prismaClient.ordemdeServico.findUnique({ where: { id }, select: { assinaturaDigital: true } });
  }

  updateAssinatura(id: string, assinaturaDigitalUrl: string) {
    return prismaClient.ordemdeServico.update({
      where: { id },
      data: { assinaturaDigital: assinaturaDigitalUrl },
      select: { assinaturaDigital: true },
    });
  }

  findForRelatorioSecretaria(where: Prisma.OrdemdeServicoWhereInput) {
    return prismaClient.ordemdeServico.findMany({
      where,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        numeroOS: true,
        descricaodoProblemaouSolicitacao: true,
        created_at: true,
        updatedAt: true,
        tipodeChamado: { select: { id: true, name: true } },
        tarefa: { select: { id: true, name: true } },
        tecnico: { select: { id: true, name: true } },
        nameTecnico: true,
        instituicaoUnidade: {
          select: {
            id: true,
            name: true,
            endereco: true,
            tipodeinstituicaoUnidade: { select: { id: true, name: true } },
          },
        },
        cliente: { select: { id: true, name: true, endereco: true } },
        statusOrdemdeServico: { select: { id: true, name: true } },
      },
    });
  }
}

const ordemdeServicoRepository = new OrdemdeServicoRepository();

export { OrdemdeServicoRepository, ordemdeServicoRepository };
