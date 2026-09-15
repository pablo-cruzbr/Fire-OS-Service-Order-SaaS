import { CreateMaquinasPendentesOroInput } from "../../../schemas/maquinasPendentesOro.schema";
import {
  MaquinasPendentesOroRepository,
  maquinasPendentesOroRepository,
} from "../../../repositories/MaquinasPendentesOroRepository";

class CreateControledeMaquinasPendentesOroService {
  constructor(private repository: MaquinasPendentesOroRepository = maquinasPendentesOroRepository) {}

  async execute(data: CreateMaquinasPendentesOroInput) {
    return this.repository.create({
      datadaInstalacao: data.datadaInstalacao,
      osInstalacao: data.osInstalacao,
      osRetirada: data.osRetirada,
      equipamento: { connect: { id: data.equipamento_id } },
      instituicaoUnidade: { connect: { id: data.instituicaoUnidade_id } },
      statusMaquinasPendentesOro: { connect: { id: data.statusMaquinasPendentesOro_id } },
    });
  }
}

export { CreateControledeMaquinasPendentesOroService };
