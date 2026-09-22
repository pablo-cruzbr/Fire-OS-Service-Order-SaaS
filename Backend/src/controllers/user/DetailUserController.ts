import { Request, Response } from "express";
import { DetailUserService } from "../../services/user/DetailUserService";

class DetailUserController {
  constructor(private service: DetailUserService = new DetailUserService()) {}

  handle = async (req: Request, res: Response) => {
    const user_id = req.user_id as string;
    const user = await this.service.execute(user_id);
    return res.json(user);
  }
}

export { DetailUserController };
