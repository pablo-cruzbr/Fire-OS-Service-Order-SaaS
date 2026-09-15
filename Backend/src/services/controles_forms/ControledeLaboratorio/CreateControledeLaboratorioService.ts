import { CreateLaboratorioInput } from "../../../schemas/laboratorio.schema";
import { LaboratorioRepository, laboratorioRepository } from "../../../repositories/LaboratorioRepository";

class CreateControledeLaboratorioService {
  constructor(private repository: LaboratorioRepository = laboratorioRepository) {}

  async execute(data: CreateLaboratorioInput) {
    return this.repository.create({
      nomedoEquipamento: data.nomedoEquipamento,
      defeito: data.defeito,
      marca: data.marca,
      osDeAbertura: data.osDeAbertura,
      osDeDevolucao: data.osDeDevolucao,
      data_de_Chegada: data.data_de_Chegada,
      data_de_Finalizacao: data.data_de_Finalizacao,
      statusControledeLaboratorio: { connect: { id: data.statusControledeLaboratorio_id } },
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });
  }
}

export { CreateControledeLaboratorioService };
