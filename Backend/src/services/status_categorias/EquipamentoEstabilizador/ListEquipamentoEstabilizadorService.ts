import { EstabilizadorRepository, estabilizadorRepository } from "../../../repositories/EstabilizadorRepository";

class ListEquipamentoEstabilizadorService {
  constructor(private repository: EstabilizadorRepository = estabilizadorRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListEquipamentoEstabilizadorService };
