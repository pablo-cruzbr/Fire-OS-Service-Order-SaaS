import { DocumentacaoTecnicaRepository, documentacaoTecnicaRepository } from "../../../repositories/DocumentacaoTecnicaRepository";

class DetailDocumentacaoTecnicaService {
  constructor(private repository: DocumentacaoTecnicaRepository = documentacaoTecnicaRepository) {}

  execute(controle_id: string) {
    return this.repository.findUnique(controle_id);
  }
}

export { DetailDocumentacaoTecnicaService };
