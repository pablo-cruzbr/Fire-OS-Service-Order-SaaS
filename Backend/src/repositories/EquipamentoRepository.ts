import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_SELECT = {
  id: true,
  name: true,
  patrimonio: true,
  instituicaoUnidade_id: true,
  tipodeEquipamento_id: true,
} satisfies Prisma.EquipamentoSelect;

class EquipamentoRepository {
  findByPatrimonio(patrimonio: string) {
    return prismaClient.equipamento.findFirst({ where: { patrimonio } });
  }

  create(data: Prisma.EquipamentoCreateInput) {
    return prismaClient.equipamento.create({ data, select: DEFAULT_SELECT });
  }

  update(id: string, data: Prisma.EquipamentoUpdateInput) {
    return prismaClient.equipamento.update({ where: { id }, data, select: DEFAULT_SELECT });
  }

  delete(id: string) {
    return prismaClient.equipamento.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.equipamento.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        patrimonio: true,
        created_at: true,
        instituicaoUnidade: { select: { id: true, name: true, endereco: true, telefone: true } },
        tipodeEquipamento: { select: { id: true, name: true } },
      },
    });
  }
}

const equipamentoRepository = new EquipamentoRepository();

export { EquipamentoRepository, equipamentoRepository };
