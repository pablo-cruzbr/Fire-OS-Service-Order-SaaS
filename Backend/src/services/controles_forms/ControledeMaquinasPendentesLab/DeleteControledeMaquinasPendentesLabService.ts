import {
  MaquinasPendentesLabRepository,
  maquinasPendentesLabRepository,
} from "../../../repositories/MaquinasPendentesLabRepository";

class DeleteControledeMaquinasPendentesLabService {
  constructor(private repository: MaquinasPendentesLabRepository = maquinasPendentesLabRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Máquinas Pendentes no Laboratório deletado com sucesso." };
  }
}

export { DeleteControledeMaquinasPendentesLabService };
