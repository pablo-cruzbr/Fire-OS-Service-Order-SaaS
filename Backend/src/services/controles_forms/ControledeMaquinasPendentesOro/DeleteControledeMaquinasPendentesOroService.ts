import {
  MaquinasPendentesOroRepository,
  maquinasPendentesOroRepository,
} from "../../../repositories/MaquinasPendentesOroRepository";

class DeleteControledeMaquinasPendentesOroService {
  constructor(private repository: MaquinasPendentesOroRepository = maquinasPendentesOroRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Máquina Pendente Oro deletado com sucesso." };
  }
}

export { DeleteControledeMaquinasPendentesOroService };
