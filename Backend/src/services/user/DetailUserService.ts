import { UserRepository, userRepository } from "../../repositories/UserRepository";
import { NotFoundError } from "../../errors/AppError";

class DetailUserService {
  constructor(private repository: UserRepository = userRepository) {}

  async execute(user_id: string) {
    const user = await this.repository.findById(user_id);

    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    return user;
  }
}

export { DetailUserService };
