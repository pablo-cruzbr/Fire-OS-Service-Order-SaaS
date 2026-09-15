import { UpdateSolicitacaoComprasInput } from "../../../schemas/solicitacaoCompras.schema";
import {
  SolicitacaoComprasRepository,
  solicitacaoComprasRepository,
} from "../../../repositories/SolicitacaoComprasRepository";

class UpdateSolicitacaodeComprasService {
  constructor(private repository: SolicitacaoComprasRepository = solicitacaoComprasRepository) {}

  async execute(id: string, data: UpdateSolicitacaoComprasInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const status = await this.repository.update(id, {
      itemSolicitado: data.itemSolicitado,
      solicitante: data.solicitante,
      motivoDaSolicitacao: data.motivoDaSolicitacao,
      preco: data.preco,
      linkDeCompra: data.linkDeCompra,
      statusCompras: data.statusCompras_id ? { connect: { id: data.statusCompras_id } } : undefined,
    });

    return { message: "Controle de Solicitacao de Compras Atualizado com sucesso.", status };
  }
}

export { UpdateSolicitacaodeComprasService };
