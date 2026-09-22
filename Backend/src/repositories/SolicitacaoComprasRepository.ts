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

  findAll() {
    return prismaClient.solicitacaoDeCompras.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        itemSolicitado: true,
        solicitante: true,
        motivoDaSolicitacao: true,
        preco: true,
        linkDeCompra: true,
        created_at: true,
        statusCompras: { select: { name: true, id: true } },
      },
    });
  }

  count() {
    return prismaClient.solicitacaoDeCompras.count();
  }

  countByStatusComprasName(name: string) {
    return prismaClient.solicitacaoDeCompras.count({ where: { statusCompras: { name } } });
  }
}

const solicitacaoComprasRepository = new SolicitacaoComprasRepository();

export { SolicitacaoComprasRepository, solicitacaoComprasRepository };
