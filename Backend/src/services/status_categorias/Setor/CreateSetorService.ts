import { SetorRepository, setorRepository } from "../../../repositories/SetorRepository";
import { CreateSetorInput } from "../../../schemas/setor.schema";

class CreateSetorService {
  constructor(private repository: SetorRepository = setorRepository) {}

  execute(data: CreateSetorInput) {
    return this.repository.create(data);
  }
}

export { CreateSetorService };
