import { UserRepository, userRepository } from "../../repositories/UserRepository";
import { InstituicaoUnidadeRepository, instituicaoUnidadeRepository } from "../../repositories/InstituicaoUnidadeRepository";
import { ClienteRepository, clienteRepository } from "../../repositories/ClienteRepository";

class ListUserService {
  constructor(
    private userRepo: UserRepository = userRepository,
    private instituicaoUnidadeRepo: InstituicaoUnidadeRepository = instituicaoUnidadeRepository,
    private clienteRepo: ClienteRepository = clienteRepository
  ) {}

  async execute() {
    const [users, total, totalInsituicao, totalcliente] = await Promise.all([
      this.userRepo.findAll(),
      this.userRepo.count(),
      this.instituicaoUnidadeRepo.count(),
      this.clienteRepo.count(),
    ]);

    return { users, total, totalInsituicao, totalcliente };
  }
}

export { ListUserService };
