import { EquipamentoRepository, equipamentoRepository } from "../../../repositories/EquipamentoRepository";

class RemoveEquipamentoService {
  constructor(private repository: EquipamentoRepository = equipamentoRepository) {}

  async execute(id: string) {
    return this.repository.delete(id);
  }
}

export { RemoveEquipamentoService };
