import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_SELECT = {
  id: true,
  usuario: true,
  andar: true,
  ramal: true,
  setor: { select: { id: true, name: true } },
  instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
  cliente: { select: { id: true, name: true, cnpj: true, endereco: true } },
} satisfies Prisma.InformacoesSetorSelect;

class InformacoesSetorRepository {
  // Unchecked em vez de CreateInput/UpdateInput normal: escreve setorId/
  // cliente_id/instituicaoUnidade_id como escalar direto, sem precisar de
  // connect aninhado — mesma forma que o código original já usava.
  create(data: Prisma.InformacoesSetorUncheckedCreateInput) {
    return prismaClient.informacoesSetor.create({ data, select: DEFAULT_SELECT });
  }

  update(id: string, data: Prisma.InformacoesSetorUncheckedUpdateInput) {
    return prismaClient.informacoesSetor.update({ where: { id }, data, select: DEFAULT_SELECT });
  }

  findAll() {
    return prismaClient.informacoesSetor.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        usuario: true,
        ramal: true,
        andar: true,
        setor: { select: { id: true, name: true } },
        cliente: { select: { id: true, name: true, endereco: true, cnpj: true } },
        instituicaoUnidade: { select: { name: true, endereco: true } },
      },
    });
  }
}

const informacoesSetorRepository = new InformacoesSetorRepository();

export { InformacoesSetorRepository, informacoesSetorRepository };
