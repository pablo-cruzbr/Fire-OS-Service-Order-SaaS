import { ClienteRepository, clienteRepository } from "../../../repositories/ClienteRepository";

class ListClienteService {
  constructor(private repository: ClienteRepository = clienteRepository) {}

  async execute() {
    const [cliente, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
    ]);

    return { cliente, total };
  }
}

export { ListClienteService };
