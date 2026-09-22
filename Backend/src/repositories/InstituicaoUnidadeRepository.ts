import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_SELECT = {
  id: true,
  name: true,
  endereco: true,
  telefone: true,
  tipodeinstituicaoUnidade_id: true,
} satisfies Prisma.InstituicaoUnidadeSelect;

class InstituicaoUnidadeRepository {
  update(id: string, data: Prisma.InstituicaoUnidadeUpdateInput) {
    return prismaClient.instituicaoUnidade.update({ where: { id }, data, select: DEFAULT_SELECT });
  }

  create(data: Prisma.InstituicaoUnidadeCreateInput) {
    return prismaClient.instituicaoUnidade.create({ data, select: DEFAULT_SELECT });
  }

  delete(id: string) {
    return prismaClient.instituicaoUnidade.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.instituicaoUnidade.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        endereco: true,
        telefone: true,
        created_at: true,
        tipodeinstituicaoUnidade: { select: { id: true, name: true } },
      },
    });
  }

  count() {
    return prismaClient.instituicaoUnidade.count();
  }
}

const instituicaoUnidadeRepository = new InstituicaoUnidadeRepository();

export { InstituicaoUnidadeRepository, instituicaoUnidadeRepository };
