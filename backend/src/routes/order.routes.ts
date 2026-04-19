import { Router } from "express";
import * as orders from "../controllers/order.controller.js";
import { optionalAuth, requireAdmin, requireAuth } from "../middlewares/auth.js";

export const orderRoutes = Router();

orderRoutes.post("/", optionalAuth, orders.createOrder);
orderRoutes.get("/me", requireAuth, orders.myOrders);
orderRoutes.get("/:orderId", optionalAuth, orders.getOrder);

export const orderAdminRoutes = Router();
orderAdminRoutes.get("/", requireAuth, requireAdmin, orders.adminOrders);
orderAdminRoutes.put("/:orderId/status", requireAuth, requireAdmin, orders.updateOrderStatus);

export const statsRoutes = Router();
statsRoutes.get("/", requireAuth, requireAdmin, orders.stats);
