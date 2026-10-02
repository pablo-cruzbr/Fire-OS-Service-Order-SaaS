import { Request, Response } from "express";
import { ListUserService } from "../../services/user/ListUserService";

class ListUserController {
  constructor(private service: ListUserService = new ListUserService()) {}

  handle = async (req: Request, res: Response) => {
    const { users, total, totalInsituicao, totalcliente } = await this.service.execute();
    return res.json({ users, total, totalInsituicao, totalcliente });
  }
}

export { ListUserController };
