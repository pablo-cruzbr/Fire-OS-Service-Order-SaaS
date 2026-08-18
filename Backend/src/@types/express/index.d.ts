import { Request } from "express";

declare global{
    namespace Express{
        interface Request{
            user_id?: string,
            user_role: string;
            user_tecnico_id?: string | null;
        }
    }
}