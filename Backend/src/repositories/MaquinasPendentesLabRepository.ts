import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  statusMaquinasPendentesLab: { select: { name: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
} satisfies Prisma.controleDeMaquinasPendentesLaboratorioInclude;

class MaquinasPendentesLabRepository {
  findUnique(id: string) {
    return prismaClient.controleDeMaquinasPendentesLaboratorio.findUnique({ where: { id } });
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
}

const maquinasPendentesLabRepository = new MaquinasPendentesLabRepository();

export { MaquinasPendentesLabRepository, maquinasPendentesLabRepository };
