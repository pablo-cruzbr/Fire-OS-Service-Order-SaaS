import { LaboratorioRepository, laboratorioRepository } from "../../../repositories/LaboratorioRepository";

class DeleteControledeLaboratorioService {
  constructor(private repository: LaboratorioRepository = laboratorioRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Laboratorio deletado com sucesso." };
  }
}

export { DeleteControledeLaboratorioService };
