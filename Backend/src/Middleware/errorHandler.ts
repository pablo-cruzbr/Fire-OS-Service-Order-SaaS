import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../errors/AppError";

function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      status: "error",
      message: "Dados inválidos.",
      errors: err.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      errors: err.details,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const campo = (err.meta?.target as string[] | undefined)?.join(", ") ?? "campo";
      return res.status(409).json({
        status: "error",
        message: `Já existe um registro com esse valor em: ${campo}.`,
      });
    }

    if (err.code === "P2025") {
      return res.status(404).json({ status: "error", message: "Registro não encontrado." });
    }

    if (err.code === "P2003") {
      return res.status(400).json({
        status: "error",
        message: "Referência inválida — o registro relacionado não existe.",
      });
    }
  }

  console.error("Erro não tratado:", err);
  return res.status(500).json({ status: "error", message: "Erro interno do servidor." });
}

export { errorHandler };
