import { ClienteRepository, clienteRepository } from "../../../repositories/ClienteRepository";

class RemoveClienteService {
  constructor(private repository: ClienteRepository = clienteRepository) {}

  execute(id: string) {
    return this.repository.delete(id);
  }
}

export { RemoveClienteService };
