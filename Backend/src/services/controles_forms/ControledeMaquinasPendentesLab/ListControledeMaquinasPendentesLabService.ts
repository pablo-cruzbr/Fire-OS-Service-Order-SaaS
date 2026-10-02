import { MaquinasPendentesLabRepository, maquinasPendentesLabRepository } from "../../../repositories/MaquinasPendentesLabRepository";

class ListControledeMaquinasPendentesLabService {
  constructor(private repository: MaquinasPendentesLabRepository = maquinasPendentesLabRepository) {}

  async execute() {
    const [controles, total, totalPendenteOro, totalSubstituta] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
      this.repository.countByStatusName("PENDENTE ORO"),
      this.repository.countByStatusName("SUBSTITUTA"),
    ]);

    return { controles, total, totalPendenteOro, totalSubstituta };
  }
}

export { ListControledeMaquinasPendentesLabService };
