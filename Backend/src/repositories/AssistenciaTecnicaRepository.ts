import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true } },
  statusReparo: { select: { name: true } },
  instituicaoUnidade: { select: { name: true } },
  tecnico: { select: { name: true } },
  cliente: { select: { name: true } },
} satisfies Prisma.controleDeAssistenciaTecnicaInclude;

class AssistenciaTecnicaRepository {
  findUnique(id: string) {
    return prismaClient.controleDeAssistenciaTecnica.findUnique({
      where: { id },
      include: { statusReparo: true },
    });
  }

  create(data: Prisma.controleDeAssistenciaTecnicaCreateInput) {
    return prismaClient.controleDeAssistenciaTecnica.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controleDeAssistenciaTecnicaUpdateInput) {
    return prismaClient.controleDeAssistenciaTecnica.update({
      where: { id },
      data,
      include: DEFAULT_INCLUDE,
    });
  }

  delete(id: string) {
    return prismaClient.controleDeAssistenciaTecnica.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.controleDeAssistenciaTecnica.findMany({
      orderBy: { created_at: "desc" },
      include: {
        equipamento: { select: { name: true, patrimonio: true, id: true } },
        statusReparo: { select: { name: true, id: true } },
        instituicaoUnidade: { select: { name: true, id: true, endereco: true } },
        tecnico: { select: { name: true, id: true } },
        cliente: { select: { name: true, id: true } },
      },
    });
  }

  count() {
    return prismaClient.controleDeAssistenciaTecnica.count();
  }

  countByStatusReparoName(name: string) {
    return prismaClient.controleDeAssistenciaTecnica.count({ where: { statusReparo: { name } } });
  }
}

const assistenciaTecnicaRepository = new AssistenciaTecnicaRepository();

export { AssistenciaTecnicaRepository, assistenciaTecnicaRepository };
