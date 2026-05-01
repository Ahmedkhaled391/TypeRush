import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const isTrustedError = err instanceof ApiError;
  const statusCode = isTrustedError ? err.statusCode : 500;

  const payload = {
    success: false,
    message: isTrustedError ? err.message : "Internal server error",
  };

  if (isTrustedError && err.details) {
    payload.details = err.details;
  }

  if (process.env.NODE_ENV !== "production" && !isTrustedError) {
    payload.error = err.message;
  }

  res.status(statusCode).json(payload);
}
