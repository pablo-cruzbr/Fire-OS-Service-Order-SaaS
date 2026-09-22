import { AssistenciaTecnicaRepository, assistenciaTecnicaRepository } from "../../../repositories/AssistenciaTecnicaRepository";

class DetailAssistenciaTecnicaService {
  constructor(private repository: AssistenciaTecnicaRepository = assistenciaTecnicaRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailAssistenciaTecnicaService };
