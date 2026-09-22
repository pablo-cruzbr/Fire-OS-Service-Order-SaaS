import { EstabilizadorRepository, estabilizadorRepository } from "../../../repositories/EstabilizadorRepository";
import { CreateEquipamentoEstabilizadorInput } from "../../../schemas/equipamentoEstabilizador.schema";

class CreateEquipamentoEstabilizadorService {
  constructor(private repository: EstabilizadorRepository = estabilizadorRepository) {}

  execute(data: CreateEquipamentoEstabilizadorInput) {
    return this.repository.create(data);
  }
}

export { CreateEquipamentoEstabilizadorService };
