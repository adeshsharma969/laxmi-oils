import { Router } from "express";
import * as categories from "../controllers/category.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const categoryRoutes = Router();

categoryRoutes.get("/", categories.listCategories);
categoryRoutes.post("/", requireAuth, requireAdmin, categories.createCategory);
categoryRoutes.put("/:slug", requireAuth, requireAdmin, categories.updateCategory);
categoryRoutes.delete("/:slug", requireAuth, requireAdmin, categories.deleteCategory);
