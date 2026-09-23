import { CreateInstituicaoUnidadeInput } from "../../../schemas/instituicaoUnidade.schema";
import {
  InstituicaoUnidadeRepository,
  instituicaoUnidadeRepository,
} from "../../../repositories/InstituicaoUnidadeRepository";

class CreateInstituicaoUnidadeService {
  constructor(private repository: InstituicaoUnidadeRepository = instituicaoUnidadeRepository) {}

  execute(data: CreateInstituicaoUnidadeInput) {
    return this.repository.create({
      name: data.name,
      endereco: data.endereco,
      telefone: data.telefone,
      tipodeinstituicaoUnidade: { connect: { id: data.tipodeInstituicaoUnidade_id } },
    });
  }
}

export { CreateInstituicaoUnidadeService };
