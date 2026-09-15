import { CreateSolicitacaoComprasInput } from "../../../schemas/solicitacaoCompras.schema";
import {
  SolicitacaoComprasRepository,
  solicitacaoComprasRepository,
} from "../../../repositories/SolicitacaoComprasRepository";

class CreateSolicitacaodeComprasService {
  constructor(private repository: SolicitacaoComprasRepository = solicitacaoComprasRepository) {}

  async execute(data: CreateSolicitacaoComprasInput) {
    return this.repository.create({
      itemSolicitado: data.itemSolicitado,
      solicitante: data.solicitante,
      motivoDaSolicitacao: data.motivoDaSolicitacao,
      preco: data.preco,
      linkDeCompra: data.linkDeCompra,
      statusCompras: { connect: { id: data.statusCompras_id } },
    });
  }
}

export { CreateSolicitacaodeComprasService };
