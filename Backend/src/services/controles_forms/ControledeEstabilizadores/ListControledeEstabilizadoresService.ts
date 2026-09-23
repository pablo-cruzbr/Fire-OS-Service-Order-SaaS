import { EstabilizadoresRepository, estabilizadoresRepository } from "../../../repositories/EstabilizadoresRepository";

class ListControledeEstabilizadoresService {
  constructor(private repository: EstabilizadoresRepository = estabilizadoresRepository) {}

  async execute() {
    const [controles, total, totalAguardandoReparo, totalFinalizado] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
      this.repository.countByStatusEstabilizadoresName("AGUARDANDO REPARO"),
      this.repository.countByStatusEstabilizadoresName("REPARO FINALIZADO"),
    ]);

    return { controles, total, totalAguardandoReparo, totalFinalizado };
  }
}

export { ListControledeEstabilizadoresService };
