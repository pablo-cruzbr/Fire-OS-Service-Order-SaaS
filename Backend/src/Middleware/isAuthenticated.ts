import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

interface Payload {
  sub: string;
  role: string;
  tecnico_id?: string | null;
}

export function isAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // 1. Recebe o Token do header
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  // 2. Remove o prefixo "Bearer "
  const [, token] = authToken.split(" ");

  try {
    // 3. Valida o Token e extrai o Payload
    // Nota: Verifique se no seu .env está JWT_SECREATE ou JWT_SECRET
    const { sub, role, tecnico_id } = verify(
      token,
      process.env.JWT_SECREATE as string
    ) as Payload;

    // 4. Injeta os dados na requisição (ficha do usuário)
    req.user_id = sub;
    req.user_role = role;
    req.user_tecnico_id = tecnico_id;

    return next();
  } catch (err) {
    // Caso o token seja inválido ou expirado
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}