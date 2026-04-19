import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/http.js";

export function notFound(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ detail: err.errors.map((e) => e.message).join(" ") });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({ detail: err.message, details: err.details });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  const status = typeof err === "object" && err && "status" in err ? Number((err as { status?: number }).status) : 500;
  return res.status(status || 500).json({ detail: message });
}
