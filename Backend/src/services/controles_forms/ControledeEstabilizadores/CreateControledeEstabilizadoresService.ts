import { CreateEstabilizadoresInput } from "../../../schemas/estabilizadores.schema";
import { EstabilizadoresRepository, estabilizadoresRepository } from "../../../repositories/EstabilizadoresRepository";

class CreateControledeEstabilizadoresService {
  constructor(private repository: EstabilizadoresRepository = estabilizadoresRepository) {}

  async execute(data: CreateEstabilizadoresInput) {
    return this.repository.create({
      idChamado: data.idChamado,
      problema: data.problema,
      observacoes: data.observacoes,
      osdaAssistencia: data.osdaAssistencia,
      // Mantido igual ao comportamento anterior: normaliza pra ISO string
      // (o campo é String no schema.prisma, não DateTime).
      datadeChegada: new Date(data.datadeChegada).toISOString(),
      datadeRetirada: new Date(data.datadeRetirada).toISOString(),
      estabilizadores: { connect: { id: data.estabilizadores_id } },
      statusEstabilizadores: { connect: { id: data.statusEstabilizadores_id } },
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });
  }
}

export { CreateControledeEstabilizadoresService };
