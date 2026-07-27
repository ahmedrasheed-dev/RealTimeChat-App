class AppError extends Error {
  public statusCode: number;
  public details: string | null | unknown;

  constructor(message: string, statusCode: number = 500, details: string | null | unknown = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export { AppError };
