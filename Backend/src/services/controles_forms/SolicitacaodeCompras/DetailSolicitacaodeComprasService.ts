import { SolicitacaoComprasRepository, solicitacaoComprasRepository } from "../../../repositories/SolicitacaoComprasRepository";

class DetailComprasService {
  constructor(private repository: SolicitacaoComprasRepository = solicitacaoComprasRepository) {}

  execute(compra_id: string) {
    return this.repository.findUnique(compra_id);
  }
}

export { DetailComprasService };
