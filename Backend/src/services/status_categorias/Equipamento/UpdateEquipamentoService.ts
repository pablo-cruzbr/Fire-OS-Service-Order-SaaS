import { UpdateEquipamentoInput } from "../../../schemas/equipamento.schema";
import { EquipamentoRepository, equipamentoRepository } from "../../../repositories/EquipamentoRepository";
import { ConflictError } from "../../../errors/AppError";

class UpdateEquipamentoService {
  constructor(private repository: EquipamentoRepository = equipamentoRepository) {}

  async execute(id: string, data: UpdateEquipamentoInput) {
    if (data.patrimonio) {
      const patrimonioEmUso = await this.repository.findByPatrimonio(data.patrimonio);
      if (patrimonioEmUso && patrimonioEmUso.id !== id) {
        throw new ConflictError("Este número de patrimônio já está em uso por outro equipamento!");
      }
    }

    // Sem checagem manual de existência do id — se não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    return this.repository.update(id, {
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

export { UpdateEquipamentoService };
