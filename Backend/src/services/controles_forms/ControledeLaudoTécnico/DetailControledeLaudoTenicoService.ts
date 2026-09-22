import { LaudoTecnicoRepository, laudoTecnicoRepository } from "../../../repositories/LaudoTecnicoRepository";

class DetailLaudoTecnicoService {
  constructor(private repository: LaudoTecnicoRepository = laudoTecnicoRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailLaudoTecnicoService };
