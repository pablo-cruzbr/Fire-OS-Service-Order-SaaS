import { LaudoTecnicoRepository, laudoTecnicoRepository } from "../../../repositories/LaudoTecnicoRepository";

class DeleteControledeLaudoTecnicoService {
  constructor(private repository: LaudoTecnicoRepository = laudoTecnicoRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Laudo técnico deletado com sucesso." };
  }
}

export { DeleteControledeLaudoTecnicoService };
