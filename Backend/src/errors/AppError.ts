class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
  }
}

class ValidationError extends AppError {
  details?: unknown;

  constructor(message = "Dados inválidos.", details?: unknown) {
    super(message, 422);
    this.name = "ValidationError";
    this.details = details;
  }
}

class NotFoundError extends AppError {
  constructor(message = "Recurso não encontrado.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

class ConflictError extends AppError {
  constructor(message = "Conflito: o recurso já existe.") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export { AppError, ValidationError, NotFoundError, ConflictError };
