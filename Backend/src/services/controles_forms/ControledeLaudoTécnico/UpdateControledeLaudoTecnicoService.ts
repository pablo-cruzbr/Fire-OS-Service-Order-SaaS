import { UpdateLaudoTecnicoInput } from "../../../schemas/laudoTecnico.schema";
import { LaudoTecnicoRepository, laudoTecnicoRepository } from "../../../repositories/LaudoTecnicoRepository";

class UpdateControledeLaudoTecnicoService {
  constructor(private repository: LaudoTecnicoRepository = laudoTecnicoRepository) {}

  async execute(id: string, data: UpdateLaudoTecnicoInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const controle = await this.repository.update(id, {
      descricaodoProblema: data.descricaodoProblema,
      mesAno: data.mesAno,
      osLab: data.osLab,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
    });

    return { message: "Controle de Laudo Técnico atualizado com sucesso.", controle };
  }
}

export { UpdateControledeLaudoTecnicoService };
