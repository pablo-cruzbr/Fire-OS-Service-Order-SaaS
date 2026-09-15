import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  estabilizadores: { select: { name: true, patrimonio: true } },
  statusEstabilizadores: { select: { name: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
} satisfies Prisma.controledeEstabilizadoresInclude;

// Sem delete() de propósito — o módulo não tem rota de delete hoje
// (só Create/List/Update), então o Repository só cobre o que existe.
class EstabilizadoresRepository {
  findUnique(id: string) {
    return prismaClient.controledeEstabilizadores.findUnique({ where: { id } });
  }

  create(data: Prisma.controledeEstabilizadoresCreateInput) {
    return prismaClient.controledeEstabilizadores.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controledeEstabilizadoresUpdateInput) {
    return prismaClient.controledeEstabilizadores.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }
}

const estabilizadoresRepository = new EstabilizadoresRepository();

export { EstabilizadoresRepository, estabilizadoresRepository };
