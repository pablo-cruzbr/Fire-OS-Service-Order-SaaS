import { MaquinasPendentesOroRepository, maquinasPendentesOroRepository } from "../../../repositories/MaquinasPendentesOroRepository";

class DetailControledeMaquinasPendentesOroService {
  constructor(private repository: MaquinasPendentesOroRepository = maquinasPendentesOroRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailControledeMaquinasPendentesOroService };
