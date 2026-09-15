import { hash } from "bcryptjs";
import { UpdateUserInput } from "../../schemas/user.schema";
import { UserRepository, userRepository } from "../../repositories/UserRepository";

class UpdateUserService {
  constructor(private repository: UserRepository = userRepository) {}

  async execute(id: string, data: UpdateUserInput) {
    const updateData: any = {
      name: data.name,
      email: data.email,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      setor: data.setor_id ? { connect: { id: data.setor_id } } : undefined,
      tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    };

    if (data.password) {
      updateData.password = await hash(data.password, 8);
    }

    // Sem checagem manual de existência antes — se o id não existir, o
    // Prisma lança P2025 e o errorHandler global já traduz pra 404, mesmo
    // padrão do UpdateOrdemdeServicoService.ts.
    return this.repository.update(id, updateData);
  }
}

export { UpdateUserService };
