import { LookupCategoriaRepository } from "../../repositories/LookupCategoriaRepository";

class DeleteLookupCategoriaService {
  constructor(private repository: LookupCategoriaRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se não existir, o Prisma lança
    // P2025 e o errorHandler global já traduz pra 404.
    return this.repository.delete(id);
  }
}

export { DeleteLookupCategoriaService };
