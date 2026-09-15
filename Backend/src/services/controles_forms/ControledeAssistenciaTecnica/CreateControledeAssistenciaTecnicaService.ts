import { CreateAssistenciaTecnicaInput } from "../../../schemas/assistenciaTecnica.schema";
import {
  AssistenciaTecnicaRepository,
  assistenciaTecnicaRepository,
} from "../../../repositories/AssistenciaTecnicaRepository";

class CreateControledeAssistenciaTecnicaService {
  constructor(private repository: AssistenciaTecnicaRepository = assistenciaTecnicaRepository) {}

  async execute(data: CreateAssistenciaTecnicaInput) {
    return this.repository.create({
      name: data.name,
      mesAno: data.mesAno,
      idChamado: data.idChamado,
      assistencia: data.assistencia,
      observacoes: data.observacoes,
      osDaAssistencia: data.osDaAssistencia,
      dataDeRetirada: data.dataDeRetirada,
      equipamento: { connect: { id: data.equipamento_id } },
      statusReparo: { connect: { id: data.statusReparo_id } },
      tecnico: { connect: { id: data.tecnico_id } },
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
    });
  }
}

export { CreateControledeAssistenciaTecnicaService };
