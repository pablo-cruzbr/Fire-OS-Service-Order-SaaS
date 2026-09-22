import { Request, Response } from "express";
import { AIChatService } from "../../../services/ai/AIChatService";
import { AIChatInput } from "../../../schemas/aiChat.schema";

class AIChatController {
  constructor(private service: AIChatService = new AIChatService()) {}

  handle = async (req: Request, res: Response) => {
    const { question } = req.body as AIChatInput;
    const user_id = req.user_id as string;

    const answer = await this.service.execute(question, user_id);

    return res.json({ answer });
  }
}

export { AIChatController };
