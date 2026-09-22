import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  statusCompras: { select: { name: true } },
} satisfies Prisma.solicitacaoDeComprasInclude;

class SolicitacaoComprasRepository {
  findUnique(id: string) {
    return prismaClient.solicitacaoDeCompras.findUnique({
      where: { id },
      include: { statusCompras: true },
    });
  }

  create(data: Prisma.solicitacaoDeComprasCreateInput) {
    return prismaClient.solicitacaoDeCompras.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.solicitacaoDeComprasUpdateInput) {
    return prismaClient.solicitacaoDeCompras.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }

  delete(id: string) {
    return prismaClient.solicitacaoDeCompras.delete({ where: { id } });
  }
}

const solicitacaoComprasRepository = new SolicitacaoComprasRepository();

export { SolicitacaoComprasRepository, solicitacaoComprasRepository };
