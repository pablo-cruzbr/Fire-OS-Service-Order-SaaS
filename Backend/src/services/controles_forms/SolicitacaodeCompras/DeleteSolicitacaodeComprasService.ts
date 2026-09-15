import {
  SolicitacaoComprasRepository,
  solicitacaoComprasRepository,
} from "../../../repositories/SolicitacaoComprasRepository";

class DeleteSolicitacaodeComprasService {
  constructor(private repository: SolicitacaoComprasRepository = solicitacaoComprasRepository) {}

  async execute(id: string) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    await this.repository.delete(id);
    return { message: "Controle de Solicitacao de Compras deletado com sucesso." };
  }
}

export { DeleteSolicitacaodeComprasService };
