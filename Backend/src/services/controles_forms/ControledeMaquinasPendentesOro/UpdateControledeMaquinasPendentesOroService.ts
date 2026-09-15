import { UpdateMaquinasPendentesOroInput } from "../../../schemas/maquinasPendentesOro.schema";
import {
  MaquinasPendentesOroRepository,
  maquinasPendentesOroRepository,
} from "../../../repositories/MaquinasPendentesOroRepository";

class UpdateControledeMaquinasPendentesOroService {
  constructor(private repository: MaquinasPendentesOroRepository = maquinasPendentesOroRepository) {}

  async execute(id: string, data: UpdateMaquinasPendentesOroInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const controle = await this.repository.update(id, {
      datadaInstalacao: data.datadaInstalacao,
      osInstalacao: data.osInstalacao,
      osRetirada: data.osRetirada,
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
      statusMaquinasPendentesOro: data.statusMaquinasPendentesOro_id
        ? { connect: { id: data.statusMaquinasPendentesOro_id } }
        : undefined,
    });

    return { message: "Controle de Máquinas Pendentes atualizado com sucesso.", controle };
  }
}

export { UpdateControledeMaquinasPendentesOroService };
