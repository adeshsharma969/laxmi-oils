import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import * as paymentService from "../services/payment.service.js";

export const createRazorpayOrder = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await paymentService.createRazorpayOrder(req.body, req.user?.user_id));
});

export const verifyRazorpayPayment = asyncHandler(async (req: Request, res: Response) => {
  res.json(await paymentService.verifyRazorpayPayment(req.body));
});
