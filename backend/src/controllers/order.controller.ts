import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async.js";
import * as orderService from "../services/order.service.js";
import { AppError } from "../utils/http.js";

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json(await orderService.createOrder(req.body, req.user));
});

export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new AppError(401, "Not authenticated");
  res.json(await orderService.getMyOrders(req.user.user_id));
});

export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  res.json(await orderService.getOrder(req.params.orderId, req.user));
});

export const adminOrders = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await orderService.listOrders());
});

export const updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  res.json(await orderService.updateOrderStatus(req.params.orderId, req.body?.status));
});

export const updateOrderTracking = asyncHandler(async (req: Request, res: Response) => {
  res.json(await orderService.updateOrderTracking(req.params.orderId, req.body));
});

export const stats = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await orderService.adminStats());
});

export const csv = asyncHandler(async (_req: Request, res: Response) => {
  const body = await orderService.ordersCsv();
  res.header("Content-Disposition", "attachment; filename=laxmi-orders.csv");
  res.type("text/csv").send(body);
});
