import { Router } from "express";
import * as payments from "../controllers/payment.controller.js";
import { optionalAuth } from "../middlewares/auth.js";

export const paymentRoutes = Router();

paymentRoutes.post("/razorpay/order", optionalAuth, payments.createRazorpayOrder);
paymentRoutes.post("/razorpay/verify", optionalAuth, payments.verifyRazorpayPayment);
