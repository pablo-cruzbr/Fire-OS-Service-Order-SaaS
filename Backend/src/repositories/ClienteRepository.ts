import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const CLIENTE_SELECT = {
  id: true,
  name: true,
  endereco: true,
  telefone: true,
  cnpj: true,
} satisfies Prisma.ClienteSelect;

class ClienteRepository {
  findAll() {
    return prismaClient.cliente.findMany({
      orderBy: { created_at: "desc" },
      select: { ...CLIENTE_SELECT, created_at: true },
    });
  }

  count() {
    return prismaClient.cliente.count();
  }

  findById(id: string) {
    return prismaClient.cliente.findUnique({ where: { id } });
  }

  create(data: Prisma.ClienteCreateInput) {
    return prismaClient.cliente.create({ data, select: CLIENTE_SELECT });
  }

  update(id: string, data: Prisma.ClienteUpdateInput) {
    return prismaClient.cliente.update({ where: { id }, data, select: CLIENTE_SELECT });
  }

  delete(id: string) {
    return prismaClient.cliente.delete({ where: { id } });
  }
}

const clienteRepository = new ClienteRepository();

export { ClienteRepository, clienteRepository };
