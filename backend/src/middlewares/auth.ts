import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { findPublicUserById } from "../services/auth.service.js";
import { AppError } from "../utils/http.js";

type TokenPayload = {
  sub: string;
  role: string;
};

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = req.header("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : req.cookies?.session_token;

  if (!token) return next();

  try {
    const payload = jwt.verify(token, env.jwtSecret) as TokenPayload;
    const user = await findPublicUserById(payload.sub);
    if (user) req.user = user;
  } catch {
    // Optional auth intentionally ignores invalid tokens.
  }

  return next();
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  await optionalAuth(req, res, async () => {
    if (!req.user) return next(new AppError(401, "Not authenticated"));
    return next();
  });
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) return next(new AppError(401, "Not authenticated"));
  if (req.user.role !== "admin") return next(new AppError(403, "Admin only"));
  return next();
}
