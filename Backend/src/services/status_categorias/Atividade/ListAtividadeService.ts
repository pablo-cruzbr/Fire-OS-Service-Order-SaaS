import { AtividadePadraoRepository, atividadePadraoRepository } from "../../../repositories/AtividadePadraoRepository";
import { ListAtividadeQuery } from "../../../schemas/atividade.schema";

class ListAtividadePadraoService {
  constructor(private repository: AtividadePadraoRepository = atividadePadraoRepository) {}

  execute({ categoria }: ListAtividadeQuery) {
    return this.repository.findAll(categoria);
  }
}

export { ListAtividadePadraoService };
