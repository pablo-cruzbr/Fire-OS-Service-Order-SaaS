import {
  InstituicaoUnidadeRepository,
  instituicaoUnidadeRepository,
} from "../../../repositories/InstituicaoUnidadeRepository";

class ListInstituicaoUnidadeService {
  constructor(private repository: InstituicaoUnidadeRepository = instituicaoUnidadeRepository) {}

  async execute() {
    const [instituicoes, total] = await Promise.all([
      this.repository.findAll(),
      this.repository.count(),
    ]);

    return { instituicoes, total };
  }
}

export { ListInstituicaoUnidadeService };
