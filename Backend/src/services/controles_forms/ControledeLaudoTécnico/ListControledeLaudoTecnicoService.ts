import { LaudoTecnicoRepository, laudoTecnicoRepository } from "../../../repositories/LaudoTecnicoRepository";

class ListControledeLaudoTecnicoService {
  constructor(private repository: LaudoTecnicoRepository = laudoTecnicoRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListControledeLaudoTecnicoService };
