import { LaboratorioRepository, laboratorioRepository } from "../../../repositories/LaboratorioRepository";

class DetailControledeLaboratorioService {
  constructor(private repository: LaboratorioRepository = laboratorioRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailControledeLaboratorioService };
