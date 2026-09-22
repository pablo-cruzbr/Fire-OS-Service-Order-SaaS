import { ClienteRepository, clienteRepository } from "../../../repositories/ClienteRepository";
import { UpdateClienteInput } from "../../../schemas/cliente.schema";

class UpdateClienteService {
  constructor(private repository: ClienteRepository = clienteRepository) {}

  // Sem checagem manual de existência antes — se o id não existir, o Prisma
  // lança P2025 e o errorHandler global já traduz pra 404.
  execute(id: string, data: UpdateClienteInput) {
    return this.repository.update(id, data);
  }
}

export { UpdateClienteService };
