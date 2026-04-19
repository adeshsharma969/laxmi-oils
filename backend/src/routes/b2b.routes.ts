import { Router } from "express";
import * as b2b from "../controllers/b2b.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const b2bRoutes = Router();
b2bRoutes.post("/leads", b2b.createLead);

export const leadAdminRoutes = Router();
leadAdminRoutes.get("/", requireAuth, requireAdmin, b2b.listLeads);
leadAdminRoutes.put("/:leadId/status", requireAuth, requireAdmin, b2b.updateLeadStatus);
