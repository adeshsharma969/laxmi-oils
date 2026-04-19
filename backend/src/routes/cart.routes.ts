import { Router } from "express";
import * as cart from "../controllers/cart.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const cartRoutes = Router();

cartRoutes.get("/", requireAuth, cart.getCart);
cartRoutes.put("/", requireAuth, cart.replaceCart);
cartRoutes.delete("/", requireAuth, cart.clearCart);
