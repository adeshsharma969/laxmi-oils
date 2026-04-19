import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import * as shippingService from "../services/shipping.service.js";

export const tracking = asyncHandler(async (req: Request, res: Response) => {
  res.json(await shippingService.getTracking(req.params.orderId));
});
