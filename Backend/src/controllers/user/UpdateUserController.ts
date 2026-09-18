import { Request, Response } from "express";
import { UpdateUserService } from "../../services/user/UpdateUSerService";
import { UpdateUserInput } from "../../schemas/user.schema";

class UpdateUserController {
  constructor(private service: UpdateUserService = new UpdateUserService()) {}

  handle = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.service.execute(id, req.body as UpdateUserInput);
    return res.json(user);
  }
}

export { UpdateUserController };
