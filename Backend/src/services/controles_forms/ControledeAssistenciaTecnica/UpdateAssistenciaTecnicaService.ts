import { UpdateAssistenciaTecnicaInput } from "../../../schemas/assistenciaTecnica.schema";
import {
  AssistenciaTecnicaRepository,
  assistenciaTecnicaRepository,
} from "../../../repositories/AssistenciaTecnicaRepository";

class UpdateAssistenciaTecnicaService {
  constructor(private repository: AssistenciaTecnicaRepository = assistenciaTecnicaRepository) {}

  async execute(id: string, data: UpdateAssistenciaTecnicaInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const controle = await this.repository.update(id, {
      name: data.name,
      mesAno: data.mesAno,
      idChamado: data.idChamado,
      assistencia: data.assistencia,
      observacoes: data.observacoes,
      osDaAssistencia: data.osDaAssistencia,
      dataDeRetirada: data.dataDeRetirada,
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      statusReparo: data.statusReparo_id ? { connect: { id: data.statusReparo_id } } : undefined,
      tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
    });

    return { message: "Controle de Assistencia Técnica Atualizado com sucesso.", controle };
  }
}

export { UpdateAssistenciaTecnicaService };
