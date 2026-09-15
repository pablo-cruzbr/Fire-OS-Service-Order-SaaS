import { UpdateDocumentacaoTecnicaInput } from "../../../schemas/documentacaoTecnica.schema";
import {
  DocumentacaoTecnicaRepository,
  documentacaoTecnicaRepository,
} from "../../../repositories/DocumentacaoTecnicaRepository";

class UpdateDocumentacaoTecnicaService {
  constructor(private repository: DocumentacaoTecnicaRepository = documentacaoTecnicaRepository) {}

  async execute(id: string, data: UpdateDocumentacaoTecnicaInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const controle = await this.repository.update(id, {
      titulo: data.titulo,
      descricao: data.descricao,
      tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });

    return { message: "Controle de Documentação Técnica Atualizado com sucesso.", controle };
  }
}

export { UpdateDocumentacaoTecnicaService };
