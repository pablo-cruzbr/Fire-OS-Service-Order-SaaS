import { SetorRepository, setorRepository } from "../../../repositories/SetorRepository";

class RemoveSetorService {
  constructor(private repository: SetorRepository = setorRepository) {}

  execute(id: string) {
    return this.repository.delete(id);
  }
}

export { RemoveSetorService };
