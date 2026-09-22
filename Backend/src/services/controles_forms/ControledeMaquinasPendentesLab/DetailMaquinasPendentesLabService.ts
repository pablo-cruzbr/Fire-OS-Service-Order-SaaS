import { MaquinasPendentesLabRepository, maquinasPendentesLabRepository } from "../../../repositories/MaquinasPendentesLabRepository";

class DetailMaquinasPendentesLabService {
  constructor(private repository: MaquinasPendentesLabRepository = maquinasPendentesLabRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailMaquinasPendentesLabService };
