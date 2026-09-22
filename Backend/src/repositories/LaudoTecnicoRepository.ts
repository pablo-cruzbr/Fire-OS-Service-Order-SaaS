import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_INCLUDE = {
  equipamento: { select: { name: true, patrimonio: true } },
  tecnico: { select: { name: true } },
  instituicaoUnidade: { select: { name: true } },
} satisfies Prisma.controleDeLaudoTecnicoInclude;

class LaudoTecnicoRepository {
  findUnique(id: string) {
    return prismaClient.controleDeLaudoTecnico.findUnique({
      where: { id },
      include: {
        equipamento: { select: { name: true, patrimonio: true } },
        tecnico: { select: { name: true } },
        instituicaoUnidade: { select: { name: true, endereco: true } },
      },
    });
  }

  create(data: Prisma.controleDeLaudoTecnicoCreateInput) {
    return prismaClient.controleDeLaudoTecnico.create({ data, include: DEFAULT_INCLUDE });
  }

  update(id: string, data: Prisma.controleDeLaudoTecnicoUpdateInput) {
    return prismaClient.controleDeLaudoTecnico.update({ where: { id }, data, include: DEFAULT_INCLUDE });
  }

  delete(id: string) {
    return prismaClient.controleDeLaudoTecnico.delete({ where: { id } });
  }

  findAll() {
    return prismaClient.controleDeLaudoTecnico.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        osLab: true,
        mesAno: true,
        descricaodoProblema: true,
        created_at: true,
        equipamento: { select: { id: true, name: true, patrimonio: true } },
        tecnico: { select: { id: true, name: true } },
        instituicaoUnidade: { select: { id: true, name: true, endereco: true } },
      },
    });
  }
}

const laudoTecnicoRepository = new LaudoTecnicoRepository();

export { LaudoTecnicoRepository, laudoTecnicoRepository };
