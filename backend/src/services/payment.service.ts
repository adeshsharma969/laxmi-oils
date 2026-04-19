import crypto from "node:crypto";
import Razorpay from "razorpay";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { AppError, toNumber } from "../utils/http.js";
import { prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

function razorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return null;
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

export async function createRazorpayOrder(input: { amount: number; currency?: string; receipt?: string }, userId?: string) {
  const amount = Math.round(toNumber(input.amount) * 100);
  if (amount <= 0) throw new AppError(400, "Amount must be greater than zero");

  const client = razorpayClient();
  const receipt = input.receipt || prefixedId("receipt", 5);

  if (!client) {
    const payment = await prisma.payment.create({
      data: {
        paymentId: prefixedId("pay", 6),
        userId,
        amount: amount / 100,
        currency: input.currency || "INR",
        status: "mock_created",
        razorpayOrderId: `order_mock_${receipt}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      },
    });
    return {
      enabled: false,
      key_id: "",
      id: payment.razorpayOrderId,
      amount,
      currency: payment.currency,
      receipt,
    };
  }

  const order = await client.orders.create({
    amount,
    currency: input.currency || "INR",
    receipt,
  });

  await prisma.payment.create({
    data: {
      paymentId: prefixedId("pay", 6),
      userId,
      amount: amount / 100,
      currency: order.currency,
      status: order.status,
      razorpayOrderId: order.id,
      raw: order as any,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  });

  return { enabled: true, key_id: env.razorpayKeyId, ...order };
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  if (!env.razorpayKeySecret) throw new AppError(400, "Razorpay is not configured");

  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", env.razorpayKeySecret).update(body).digest("hex");
  const valid = expected === input.razorpay_signature;

  if (!valid) throw new AppError(400, "Invalid Razorpay signature");

  const payment = await prisma.payment.updateMany({
    where: { razorpayOrderId: input.razorpay_order_id },
    data: {
      status: "paid",
      razorpayPaymentId: input.razorpay_payment_id,
      signature: input.razorpay_signature,
      updatedAt: nowIso(),
    },
  });

  return { ok: payment.count > 0 };
}
