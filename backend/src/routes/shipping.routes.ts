import { Router } from "express";
import * as shipping from "../controllers/shipping.controller.js";
import { optionalAuth } from "../middlewares/auth.js";

export const shippingRoutes = Router();

shippingRoutes.get("/:orderId/track", optionalAuth, shipping.tracking);
