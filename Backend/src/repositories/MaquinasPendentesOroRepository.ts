import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
  statusMaquinasPendentesOro: { select: { name: true } },
} satisfies Prisma.controledeMaquinasPendentesOroInclude;

class MaquinasPendentesOroRepository {
  findUnique(id: string) {
    return prismaClient.controledeMaquinasPendentesOro.findUnique({
      where: { id },
      include: { statusMaquinasPendentesOro: true },
    });
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

  findAll() {
    return prismaClient.controledeMaquinasPendentesOro.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        datadaInstalacao: true,
        osInstalacao: true,
        osRetirada: true,
        created_at: true,
        equipamento: { select: { id: true, name: true, patrimonio: true } },
        statusMaquinasPendentesOro: { select: { id: true, name: true } },
        instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
      },
    });
  }

  count() {
    return prismaClient.controledeMaquinasPendentesOro.count();
  }

  countByStatusName(name: string) {
    return prismaClient.controledeMaquinasPendentesOro.count({
      where: { statusMaquinasPendentesOro: { name } },
    });
  }
}

const maquinasPendentesOroRepository = new MaquinasPendentesOroRepository();

export { MaquinasPendentesOroRepository, maquinasPendentesOroRepository };
