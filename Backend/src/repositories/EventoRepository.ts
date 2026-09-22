import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

// Isola as chamadas prismaClient.event.* num único lugar, mesmo padrão
// usado no resto do rollout — permite testar o Service com um repository
// fake em vez de mockar o módulo do Prisma.
class EventoRepository {
  findAll() {
    return prismaClient.event.findMany({ orderBy: { start_date: "asc" } });
  }

  create(data: Prisma.EventCreateInput) {
    return prismaClient.event.create({ data });
  }

  update(id: number, data: Prisma.EventUpdateInput) {
    return prismaClient.event.update({ where: { id }, data });
  }

  delete(id: number) {
    return prismaClient.event.delete({ where: { id } });
  }
}

const eventoRepository = new EventoRepository();

export { EventoRepository, eventoRepository };
