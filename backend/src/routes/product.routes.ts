import { Router } from "express";
import * as products from "../controllers/product.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.js";

export const productRoutes = Router();

productRoutes.get("/", products.listProducts);
productRoutes.get("/:productId", products.getProduct);
productRoutes.post("/", requireAuth, requireAdmin, products.createProduct);
productRoutes.put("/:productId", requireAuth, requireAdmin, products.updateProduct);
productRoutes.delete("/:productId", requireAuth, requireAdmin, products.deleteProduct);
