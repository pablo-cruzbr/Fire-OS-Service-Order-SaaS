import { Request, Response } from "express";
import { AuthUserService } from "../../services/user/AuthUserService";
import { AuthUserInput } from "../../schemas/user.schema";

class AuthUserController {
  constructor(private service: AuthUserService = new AuthUserService()) {}

  handle = async (req: Request, res: Response) => {
    const auth = await this.service.execute(req.body as AuthUserInput);
    return res.json(auth);
  }
}

export { AuthUserController };
