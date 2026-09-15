import { CreateMaquinasPendentesLabInput } from "../../../schemas/maquinasPendentesLab.schema";
import {
  MaquinasPendentesLabRepository,
  maquinasPendentesLabRepository,
} from "../../../repositories/MaquinasPendentesLabRepository";

class CreateControledeMaquinasPendentesLabService {
  constructor(private repository: MaquinasPendentesLabRepository = maquinasPendentesLabRepository) {}

  async execute(data: CreateMaquinasPendentesLabInput) {
    return this.repository.create({
      numeroDeSerie: data.numeroDeSerie,
      ssd: data.ssd,
      idDaOs: data.idDaOs,
      obs: data.obs,
      equipamento: { connect: { id: data.equipamento_id } },
      statusMaquinasPendentesLab: { connect: { id: data.statusMaquinasPendentesLab_id } },
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });
  }
}

export { CreateControledeMaquinasPendentesLabService };
