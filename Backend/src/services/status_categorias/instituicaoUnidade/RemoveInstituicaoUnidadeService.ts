import {
  InstituicaoUnidadeRepository,
  instituicaoUnidadeRepository,
} from "../../../repositories/InstituicaoUnidadeRepository";

class RemoveInstituicaoUnidadeService {
  constructor(private repository: InstituicaoUnidadeRepository = instituicaoUnidadeRepository) {}

  execute(id: string) {
    return this.repository.delete(id);
  }
}

export { RemoveInstituicaoUnidadeService };
