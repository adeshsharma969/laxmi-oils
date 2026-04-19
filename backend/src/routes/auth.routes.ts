import { Router } from "express";
import * as auth from "../controllers/auth.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", auth.register);
authRoutes.post("/login", auth.login);
authRoutes.post("/google-session", auth.googleSession);
authRoutes.get("/me", requireAuth, auth.me);
authRoutes.post("/logout", auth.logout);

export const referralRoutes = Router();
referralRoutes.get("/me", requireAuth, auth.referrals);

export const userAdminRoutes = Router();
userAdminRoutes.get("/", requireAuth, requireAdmin, auth.listUsers);
userAdminRoutes.put("/:userId/role", requireAuth, requireAdmin, auth.updateRole);
