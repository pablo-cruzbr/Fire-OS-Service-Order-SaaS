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
}

const laboratorioRepository = new LaboratorioRepository();

export { LaboratorioRepository, laboratorioRepository };
