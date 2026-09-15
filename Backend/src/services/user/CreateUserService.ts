import { hash } from "bcryptjs";
import { CreateUserInput } from "../../schemas/user.schema";
import { ConflictError } from "../../errors/AppError";
import { UserRepository, userRepository } from "../../repositories/UserRepository";

class CreateUserService {
  constructor(private repository: UserRepository = userRepository) {}

  async execute(data: CreateUserInput) {
    const userAlreadyExists = await this.repository.findByEmail(data.email);

    if (userAlreadyExists) {
      throw new ConflictError("Esse email já existe.");
    }

    const passwordHash = await hash(data.password, 8);

    return this.repository.create({
      name: data.name,
      email: data.email,
      password: passwordHash,
      cliente: data.cliente_id ? { connect: { id: data.cliente_id } } : undefined,
      setor: data.setor_id ? { connect: { id: data.setor_id } } : undefined,
      tecnico: data.tecnico_id ? { connect: { id: data.tecnico_id } } : undefined,
      instituicaoUnidade: data.instituicaoUnidade_id
        ? { connect: { id: data.instituicaoUnidade_id } }
        : undefined,
    });
  }
}

export { CreateUserService };
