import {
  DocumentacaoTecnicaRepository,
  documentacaoTecnicaRepository,
} from "../../../repositories/DocumentacaoTecnicaRepository";

class DeleteDocumentacaoTecnicaService {
  constructor(private repository: DocumentacaoTecnicaRepository = documentacaoTecnicaRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Documentação técnica deletado com sucesso." };
  }
}

export { DeleteDocumentacaoTecnicaService };
