import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middlewares/async.js";
import * as authService from "../services/auth.service.js";
import { AppError } from "../utils/http.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  phone: z.string().optional(),
  ref: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = registerSchema.parse(req.body);
  res.status(201).json(await authService.register(body as authService.RegisterInput));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const body = loginSchema.parse(req.body);
  res.json(await authService.login(body.email, body.password));
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(req.user);
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie("session_token");
  res.json({ ok: true });
});

export const googleSession = asyncHandler(async () => {
  throw new AppError(501, "Google OAuth is not configured");
});

export const referrals = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(await authService.getReferralSummary(req.user.user_id));
});

export const listUsers = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await authService.listUsers());
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  res.json(await authService.updateUserRole(req.params.userId, req.body?.role));
});
