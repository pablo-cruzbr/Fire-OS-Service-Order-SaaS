import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

class SetorRepository {
  findAll() {
    return prismaClient.setor.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true },
    });
  }

  create(data: Prisma.SetorCreateInput) {
    return prismaClient.setor.create({ data, select: { id: true, name: true } });
  }

  delete(id: string) {
    return prismaClient.setor.delete({ where: { id } });
  }
}

const setorRepository = new SetorRepository();

export { SetorRepository, setorRepository };
