import { UpdateMaquinasPendentesLabInput } from "../../../schemas/maquinasPendentesLab.schema";
import {
  MaquinasPendentesLabRepository,
  maquinasPendentesLabRepository,
} from "../../../repositories/MaquinasPendentesLabRepository";

class UpdateControledeMaquinasPendentesLabService {
  constructor(private repository: MaquinasPendentesLabRepository = maquinasPendentesLabRepository) {}

  async execute(id: string, data: UpdateMaquinasPendentesLabInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    const controle = await this.repository.update(id, {
      numeroDeSerie: data.numeroDeSerie,
      ssd: data.ssd,
      idDaOs: data.idDaOs,
      obs: data.obs,
      equipamento: data.equipamento_id ? { connect: { id: data.equipamento_id } } : undefined,
      statusMaquinasPendentesLab: data.statusMaquinasPendentesLab_id
        ? { connect: { id: data.statusMaquinasPendentesLab_id } }
        : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });

    return { message: "Controle de Máquinas Pendentes atualizado com sucesso.", controle };
  }
}

export { UpdateControledeMaquinasPendentesLabService };
