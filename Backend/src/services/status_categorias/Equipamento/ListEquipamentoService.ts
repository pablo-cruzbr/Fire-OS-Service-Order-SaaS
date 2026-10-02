import { EquipamentoRepository, equipamentoRepository } from "../../../repositories/EquipamentoRepository";

class ListEquipamentoService {
  constructor(private repository: EquipamentoRepository = equipamentoRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListEquipamentoService };
