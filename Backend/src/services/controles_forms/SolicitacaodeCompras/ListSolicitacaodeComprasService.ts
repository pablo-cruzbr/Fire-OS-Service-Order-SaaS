import { SolicitacaoComprasRepository, solicitacaoComprasRepository } from "../../../repositories/SolicitacaoComprasRepository";

class ListSolicitacaodeComprasService {
  constructor(private repository: SolicitacaoComprasRepository = solicitacaoComprasRepository) {}

  async execute() {
    const [controles, total, totalAguardandoCompra, totalAguardandoEntrega, totalCompraFinalizada] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
      this.repository.countByStatusComprasName("AGUARDANDO COMPRA"),
      this.repository.countByStatusComprasName("AGUARDANDO ENTREGA"),
      this.repository.countByStatusComprasName("COMPRA FINALIZADA"),
    ]);

    return { controles, total, totalAguardandoCompra, totalAguardandoEntrega, totalCompraFinalizada };
  }
}

export { ListSolicitacaodeComprasService };
