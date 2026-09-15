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
}

const instituicaoUnidadeRepository = new InstituicaoUnidadeRepository();

export { InstituicaoUnidadeRepository, instituicaoUnidadeRepository };
