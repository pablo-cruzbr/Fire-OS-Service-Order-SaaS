import { CreateLaudoTecnicoInput } from "../../../schemas/laudoTecnico.schema";
import { LaudoTecnicoRepository, laudoTecnicoRepository } from "../../../repositories/LaudoTecnicoRepository";

class CreateControledeLaudoTecnicoService {
  constructor(private repository: LaudoTecnicoRepository = laudoTecnicoRepository) {}

  async execute(data: CreateLaudoTecnicoInput) {
    return this.repository.create({
      descricaodoProblema: data.descricaodoProblema,
      mesAno: data.mesAno,
      osLab: data.osLab,
      instituicaoUnidade: { connect: { id: data.instituicaoUnidade_id } },
      equipamento: { connect: { id: data.equipamento_id } },
      tecnico: { connect: { id: data.tecnico_id } },
    });
  }
}

export { CreateControledeLaudoTecnicoService };
