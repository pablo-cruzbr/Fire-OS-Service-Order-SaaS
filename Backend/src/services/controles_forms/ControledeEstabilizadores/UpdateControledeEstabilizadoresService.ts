import { UpdateEstabilizadoresInput } from "../../../schemas/estabilizadores.schema";
import { EstabilizadoresRepository, estabilizadoresRepository } from "../../../repositories/EstabilizadoresRepository";

class UpdateControledeEstabilizadoresService {
  constructor(private repository: EstabilizadoresRepository = estabilizadoresRepository) {}

  async execute(id: string, data: UpdateEstabilizadoresInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const status = await this.repository.update(id, {
      idChamado: data.idChamado,
      problema: data.problema,
      observacoes: data.observacoes,
      osdaAssistencia: data.osdaAssistencia,
      datadeChegada: data.datadeChegada ? new Date(data.datadeChegada).toISOString() : undefined,
      datadeRetirada: data.datadeRetirada ? new Date(data.datadeRetirada).toISOString() : undefined,
      estabilizadores: data.estabilizadores_id ? { connect: { id: data.estabilizadores_id } } : undefined,
      statusEstabilizadores: data.statusEstabilizadores_id
        ? { connect: { id: data.statusEstabilizadores_id } }
        : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });

    return { message: "Controle de Estabilizadores atualizado com sucesso.", status };
  }
}

export { UpdateControledeEstabilizadoresService };
