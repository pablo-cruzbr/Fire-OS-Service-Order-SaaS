import { DocumentacaoTecnicaRepository, documentacaoTecnicaRepository } from "../../../repositories/DocumentacaoTecnicaRepository";

class ListDocumentacaoTecnicaService {
  constructor(private repository: DocumentacaoTecnicaRepository = documentacaoTecnicaRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListDocumentacaoTecnicaService };
