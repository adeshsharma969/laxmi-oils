import { Router } from "express";
import * as coupons from "../controllers/coupon.controller.js";

export const couponRoutes = Router();

couponRoutes.post("/validate", coupons.validateCoupon);
