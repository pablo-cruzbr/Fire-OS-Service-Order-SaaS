import { Request, Response } from "express";
import { CreateUserService } from "../../services/user/CreateUserService";
import { CreateUserInput } from "../../schemas/user.schema";

class CreateUserController {
  constructor(private service: CreateUserService = new CreateUserService()) {}

  async handle(req: Request, res: Response) {
    const user = await this.service.execute(req.body as CreateUserInput);
    return res.json({ user });
  }
}

export { CreateUserController };
