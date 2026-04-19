import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import { resolveCoupon } from "../services/coupon.service.js";

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  res.json(await resolveCoupon(req.body?.code, req.body?.email));
});
