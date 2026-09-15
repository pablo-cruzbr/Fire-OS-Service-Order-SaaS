import { CreateEquipamentoInput } from "../../../schemas/equipamento.schema";
import { EquipamentoRepository, equipamentoRepository } from "../../../repositories/EquipamentoRepository";
import { ConflictError } from "../../../errors/AppError";

class CreateEquipamentoService {
  constructor(private repository: EquipamentoRepository = equipamentoRepository) {}

  async execute(data: CreateEquipamentoInput) {
    const patrimonioEmUso = await this.repository.findByPatrimonio(data.patrimonio);

    if (patrimonioEmUso) {
      throw new ConflictError("Esse patrimônio já existe!");
    }

    return this.repository.create({
      name: data.name,
      patrimonio: data.patrimonio,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
      tipodeEquipamento: data.tipodeEquipamento_id
        ? { connect: { id: data.tipodeEquipamento_id } }
        : undefined,
    });
  }
}

export { CreateEquipamentoService };
