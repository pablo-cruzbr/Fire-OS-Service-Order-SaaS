import { UpdateInstituicaoUnidadeInput } from "../../../schemas/instituicaoUnidade.schema";
import {
  InstituicaoUnidadeRepository,
  instituicaoUnidadeRepository,
} from "../../../repositories/InstituicaoUnidadeRepository";

class UpdateInstituicaoUnidadeService {
  constructor(private repository: InstituicaoUnidadeRepository = instituicaoUnidadeRepository) {}

  async execute(id: string, data: UpdateInstituicaoUnidadeInput) {
    // Sem checagem manual de existência — se o id não existir, o Prisma
    // lança P2025 e o errorHandler global já traduz pra 404.
    return this.repository.update(id, {
      name: data.name,
      endereco: data.endereco,
      telefone: data.telefone,
      tipodeinstituicaoUnidade: { connect: { id: data.tipodeInstituicaoUnidade_id } },
    });
  }
}

export { UpdateInstituicaoUnidadeService };
