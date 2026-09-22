import { SetorRepository, setorRepository } from "../../../repositories/SetorRepository";

class ListSetoresService {
  constructor(private repository: SetorRepository = setorRepository) {}

  execute() {
    return this.repository.findAll();
  }
}

export { ListSetoresService };
