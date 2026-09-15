import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  cliente: { select: { name: true } },
  tecnico: { select: { name: true } },
  instituicaoUnidade: { select: { name: true, endereco: true } },
} satisfies Prisma.documentacaoTecnicaInclude;

class DocumentacaoTecnicaRepository {
  findUnique(id: string) {
    return prismaClient.documentacaoTecnica.findUnique({ where: { id } });
  }

  create(data: Prisma.documentacaoTecnicaCreateInput) {
    return prismaClient.documentacaoTecnica.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.documentacaoTecnicaUpdateInput) {
    return prismaClient.documentacaoTecnica.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }

  delete(id: string) {
    return prismaClient.documentacaoTecnica.delete({ where: { id } });
  }
}

const documentacaoTecnicaRepository = new DocumentacaoTecnicaRepository();

export { DocumentacaoTecnicaRepository, documentacaoTecnicaRepository };
