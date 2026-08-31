import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ValidationError } from "../errors/AppError";

type Source = "body" | "params" | "query";

function validate(schema: ZodType, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      }));
      throw new ValidationError("Dados inválidos.", details);
    }

    req[source] = result.data;
    next();
  };
}

export { validate };
