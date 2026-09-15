import { UpdateLaboratorioInput } from "../../../schemas/laboratorio.schema";
import { LaboratorioRepository, laboratorioRepository } from "../../../repositories/LaboratorioRepository";

class UpdateControledeLaboratorioService {
  constructor(private repository: LaboratorioRepository = laboratorioRepository) {}

  async execute(id: string, data: UpdateLaboratorioInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const status = await this.repository.update(id, {
      nomedoEquipamento: data.nomedoEquipamento,
      defeito: data.defeito,
      marca: data.marca,
      osDeAbertura: data.osDeAbertura,
      osDeDevolucao: data.osDeDevolucao,
      data_de_Chegada: data.data_de_Chegada,
      data_de_Finalizacao: data.data_de_Finalizacao,
      statusControledeLaboratorio: data.statusControledeLaboratorio_id
        ? { connect: { id: data.statusControledeLaboratorio_id } }
        : undefined,
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });

    return { message: "Controle de Laboratório atualizado com sucesso.", status };
  }
}

export { UpdateControledeLaboratorioService };
