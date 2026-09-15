import { compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { AuthUserInput } from "../../schemas/user.schema";
import { UnauthorizedError } from "../../errors/AppError";
import { UserRepository, userRepository } from "../../repositories/UserRepository";

class AuthUserService {
  constructor(private repository: UserRepository = userRepository) {}

  async execute({ email, password }: AuthUserInput) {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError("usuário ou senha está incorreta");
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedError("usuário ou senha está incorreta");
    }

    const token = sign(
      {
        name: user.name,
        email: user.email,
        role: user.role,
        tecnico_id: user.tecnico_id,
      },
      process.env.JWT_SECREATE,
      {
        subject: user.id,
        expiresIn: "30d",
      }
    );

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token,
      role: user.role,
      tecnico_id: user.tecnico_id,
    };
  }
}

export { AuthUserService };
