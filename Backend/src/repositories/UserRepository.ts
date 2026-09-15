import { Prisma } from "@prisma/client";
import prismaClient from "../prisma";

const DEFAULT_SELECT = {
  id: true,
  name: true,
  email: true,
  tecnico_id: true,
  instituicaoUnidade: {
    select: { id: true, name: true, endereco: true },
  },
  cliente: {
    select: { id: true, name: true, endereco: true },
  },
  setor: {
    select: { id: true, name: true },
  },
} satisfies Prisma.UserSelect;

// Isola as chamadas prismaClient.user.* num único lugar, pra o Service não
// precisar saber que existe um Prisma por trás — mesmo padrão do
// OrdemdeServicoRepository.ts, aplicado agora no módulo de user.
class UserRepository {
  findByEmail(email: string) {
    return prismaClient.user.findFirst({ where: { email } });
  }

  create(data: Prisma.UserCreateInput) {
    return prismaClient.user.create({ data, select: DEFAULT_SELECT });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return prismaClient.user.update({ where: { id }, data, select: DEFAULT_SELECT });
  }
}

const userRepository = new UserRepository();

export { UserRepository, userRepository };
