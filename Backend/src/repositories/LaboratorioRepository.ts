import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  cliente: { select: { name: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
  statusControledeLaboratorio: { select: { name: true } },
} satisfies Prisma.controleDeLaboratorioInclude;

class LaboratorioRepository {
  findUnique(id: string) {
    return prismaClient.controleDeLaboratorio.findUnique({
      where: { id },
      include: { statusControledeLaboratorio: true },
    });
  }

  create(data: Prisma.controleDeLaboratorioCreateInput) {
    return prismaClient.controleDeLaboratorio.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controleDeLaboratorioUpdateInput) {
    return prismaClient.controleDeLaboratorio.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }

  delete(id: string) {
    return prismaClient.controleDeLaboratorio.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.controleDeLaboratorio.findMany({
      orderBy: { created_at: "desc" },
      include: {
        equipamento: { select: { id: true, name: true, patrimonio: true } },
        instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
        cliente: { select: { id: true, name: true } },
        statusControledeLaboratorio: { select: { id: true, name: true } },
      },
    });
  }

  count() {
    return prismaClient.controleDeLaboratorio.count();
  }

  countByStatusName(name: string) {
    return prismaClient.controleDeLaboratorio.count({ where: { statusControledeLaboratorio: { name } } });
  }
}

const laboratorioRepository = new LaboratorioRepository();

export { LaboratorioRepository, laboratorioRepository };
