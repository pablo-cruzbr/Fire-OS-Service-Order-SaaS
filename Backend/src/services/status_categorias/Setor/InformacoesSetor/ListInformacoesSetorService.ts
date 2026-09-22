import { InformacoesSetorRepository, informacoesSetorRepository } from "../../../../repositories/InformacoesSetorRepository";

class ListInformacoesSetorService {
  constructor(private repository: InformacoesSetorRepository = informacoesSetorRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListInformacoesSetorService };
