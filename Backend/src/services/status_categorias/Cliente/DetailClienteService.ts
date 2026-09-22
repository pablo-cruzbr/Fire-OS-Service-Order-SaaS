import { ClienteRepository, clienteRepository } from "../../../repositories/ClienteRepository";

class DetailClienteService {
  constructor(private repository: ClienteRepository = clienteRepository) {}

  execute(controle_id: string) {
    return this.repository.findById(controle_id);
  }
}

export { DetailClienteService };
