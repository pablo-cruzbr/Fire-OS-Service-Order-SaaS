import { MaquinasPendentesOroRepository, maquinasPendentesOroRepository } from "../../../repositories/MaquinasPendentesOroRepository";

class ListControledeMaquinasPendentesOroService {
  constructor(private repository: MaquinasPendentesOroRepository = maquinasPendentesOroRepository) {}

  // Achado no caminho: a versão antiga também contava "RESERVADA"
  // (totalReservada), mas o Controller nunca devolvia esse campo no JSON —
  // query descartada, removida daqui.
  async execute() {
    const [controles, total, totalDisponivel, totalInstalada, totalAguardandoRetirada, totalEmManutencao, totalDescartada] =
      await Promise.all([
        this.repository.findAll(),
        this.repository.count(),
        this.repository.countByStatusName("DISPONIVEL"),
        this.repository.countByStatusName("INSTALADA"),
        this.repository.countByStatusName("AGUARDANDO RETIRADA"),
        this.repository.countByStatusName("EM MANUTENÇÃO"),
        this.repository.countByStatusName("DESCARTADA"),
      ]);

    return {
      controles,
      total,
      totalAguardandoRetirada,
      totalDescartada,
      totalDisponivel,
      totalEmManutencao,
      totalInstalada,
    };
  }
}

export { ListControledeMaquinasPendentesOroService };
