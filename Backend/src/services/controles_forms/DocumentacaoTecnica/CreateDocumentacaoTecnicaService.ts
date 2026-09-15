import { CreateDocumentacaoTecnicaInput } from "../../../schemas/documentacaoTecnica.schema";
import {
  DocumentacaoTecnicaRepository,
  documentacaoTecnicaRepository,
} from "../../../repositories/DocumentacaoTecnicaRepository";

class CreateDocumentacaoTecnicaService {
  constructor(private repository: DocumentacaoTecnicaRepository = documentacaoTecnicaRepository) {}

  async execute(data: CreateDocumentacaoTecnicaInput) {
    return this.repository.create({
      titulo: data.titulo,
      descricao: data.descricao,
      tecnico: { connect: { id: data.tecnico_id } },
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });
  }
}

export { CreateDocumentacaoTecnicaService };
