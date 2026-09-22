import { LaboratorioRepository, laboratorioRepository } from "../../../repositories/LaboratorioRepository";

class ListControledeLaboratorioService {
  constructor(private repository: LaboratorioRepository = laboratorioRepository) {}

  // Achado no caminho: a versão antiga também contava "CONCLUIDO", mas nunca
  // devolvia esse total no JSON (nem o Frontend usa) — query descartada,
  // removida daqui.
  async execute() {
    const [controles, total, totalAguardandoConserto, totalAguardandoOSdeLaboratorio, totalAguardandoDevolucao] =
      await Promise.all([
        this.repository.findAll(),
        this.repository.count(),
        this.repository.countByStatusName("AGUARDANDO CONSERTO"),
        this.repository.countByStatusName("AGUARDANDO O.S DE LABORATÓRIO"),
        this.repository.countByStatusName("AGUARDANDO DEVOLUÇÃO"),
      ]);

    return {
      controles,
      total,
      totalAguardandoConserto,
      totalAguardandoDevolucao,
      totalAguardandoOSdeLaboratorio,
    };
  }
}

export { ListControledeLaboratorioService };
