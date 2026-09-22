import { ClienteRepository, clienteRepository } from "../../../repositories/ClienteRepository";
import { CreateClienteInput } from "../../../schemas/cliente.schema";

class CreateClienteService {
  constructor(private repository: ClienteRepository = clienteRepository) {}

  execute(data: CreateClienteInput) {
    return this.repository.create(data);
  }
}

export { CreateClienteService };
