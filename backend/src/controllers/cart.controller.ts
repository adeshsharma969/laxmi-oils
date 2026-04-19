import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import * as cartService from "../services/cart.service.js";
import { AppError } from "../utils/http.js";

export const getCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(await cartService.getCart(req.user.user_id));
});

export const replaceCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(await cartService.replaceCart(req.user.user_id, req.body?.items || []));
});

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(await cartService.clearCart(req.user.user_id));
});
