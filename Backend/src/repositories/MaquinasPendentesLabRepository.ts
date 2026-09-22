import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  statusMaquinasPendentesLab: { select: { name: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
} satisfies Prisma.controleDeMaquinasPendentesLaboratorioInclude;

class MaquinasPendentesLabRepository {
  findUnique(id: string) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.findUnique({
      where: { id },
      include: {
        statusMaquinasPendentesLab: { select: { name: true } },
        equipamento: { select: { name: true } },
        instituicaoUnidade: { select: { name: true, endereco: true } },
      },
    });
  }

  create(data: Prisma.controleDeMaquinasPendentesLaboratorioCreateInput) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controleDeMaquinasPendentesLaboratorioUpdateInput) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.update({
      where: { id },
      data,
      include: DEFAULT_INCLUDE,
    });
  }

  delete(id: string) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        numeroDeSerie: true,
        ssd: true,
        idDaOs: true,
        obs: true,
        created_at: true,
        equipamento: { select: { id: true, name: true, patrimonio: true } },
        statusMaquinasPendentesLab: { select: { id: true, name: true } },
        instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
      },
    });
  }

  count() {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.count();
  }

  countByStatusName(name: string) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.count({
      where: { statusMaquinasPendentesLab: { name } },
    });
  }
}

const maquinasPendentesLabRepository = new MaquinasPendentesLabRepository();

export { MaquinasPendentesLabRepository, maquinasPendentesLabRepository };
