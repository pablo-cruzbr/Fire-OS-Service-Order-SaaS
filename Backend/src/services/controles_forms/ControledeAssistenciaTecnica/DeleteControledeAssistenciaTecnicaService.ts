import {
  AssistenciaTecnicaRepository,
  assistenciaTecnicaRepository,
} from "../../../repositories/AssistenciaTecnicaRepository";

class DeleteControledeAssistenciaTecnicaService {
  constructor(private repository: AssistenciaTecnicaRepository = assistenciaTecnicaRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de assistência técnica deletado com sucesso." };
  }
}

export { DeleteControledeAssistenciaTecnicaService };
