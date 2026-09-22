import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

class TecnicoRepository {
  findAll() {
    return prismaClient.tecnico.findMany({
      orderBy: { created_at: "desc" },
      select: { id: true, name: true, created_at: true },
    });
  }

  count() {
    return prismaClient.tecnico.count();
  }

  create(data: Prisma.TecnicoCreateInput) {
    return prismaClient.tecnico.create({ data, select: { id: true, name: true } });
  }

  delete(id: string) {
    return prismaClient.tecnico.delete({ where: { id } });
  }
}

const tecnicoRepository = new TecnicoRepository();

export { TecnicoRepository, tecnicoRepository };
