import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
  statusMaquinasPendentesOro: { select: { name: true } },
} satisfies Prisma.controledeMaquinasPendentesOroInclude;

class MaquinasPendentesOroRepository {
  findUnique(id: string) {
    return prismaClient.controledeMaquinasPendentesOro.findUnique({ where: { id } });
  }

  create(data: Prisma.controledeMaquinasPendentesOroCreateInput) {
    return prismaClient.controledeMaquinasPendentesOro.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controledeMaquinasPendentesOroUpdateInput) {
    return prismaClient.controledeMaquinasPendentesOro.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }

  delete(id: string) {
    return prismaClient.controledeMaquinasPendentesOro.delete({ where: { id } });
  }
}

const maquinasPendentesOroRepository = new MaquinasPendentesOroRepository();

export { MaquinasPendentesOroRepository, maquinasPendentesOroRepository };
