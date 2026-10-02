import { AssistenciaTecnicaRepository, assistenciaTecnicaRepository } from "../../../repositories/AssistenciaTecnicaRepository";

class ListControledeAssistenciaTecnicaService {
  constructor(private repository: AssistenciaTecnicaRepository = assistenciaTecnicaRepository) {}

  async execute() {
    const [controles, total, totalAguardandoReparo, totalFinalizado] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
      this.repository.countByStatusReparoName("AGUARDANDO REPARO"),
      this.repository.countByStatusReparoName("REPARO FINALIZADO"),
    ]);

    return { controles, total, totalAguardandoReparo, totalFinalizado };
  }
}

export { ListControledeAssistenciaTecnicaService };
