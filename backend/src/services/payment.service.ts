import crypto from "node:crypto";
import Razorpay from "razorpay";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { AppError, toNumber } from "../utils/http.js";
import { prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

type RazorpayError = Error & {
  statusCode?: number;
  error?: {
    code?: string;
    description?: string;
  };
};

function razorpayClient() {
  if (!env.razorpayKeyId || !env.razorpayKeySecret) return null;
  return new Razorpay({
    key_id: env.razorpayKeyId,
    key_secret: env.razorpayKeySecret,
  });
}

function toRazorpayAppError(error: unknown) {
  const err = error as RazorpayError;
  const statusCode = Number(err?.statusCode || 500);
  const description = err?.error?.description || err?.message || "Could not create Razorpay order";

  if (statusCode === 401) {
    return new AppError(401, "Razorpay authentication failed");
  }

  return new AppError(500, "Could not create Razorpay order", description);
}

export async function createRazorpayOrder(input: { amount: number; currency?: string; receipt?: string }, userId?: string) {
  const amount = Math.round(toNumber(input.amount));
  if (amount < 100) throw new AppError(400, "Amount must be at least 100 paise");

  const client = razorpayClient();
  const receipt = input.receipt || prefixedId("receipt", 5);

  if (!client) {
    throw new AppError(401, "Razorpay credentials are not configured");
  }

  try {
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

    return {
      order_id: order.id,
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: env.razorpayKeyId,
    };
  } catch (error) {
    throw toRazorpayAppError(error);
  }
}

export async function verifyRazorpayPayment(input: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) {
  if (!env.razorpayKeySecret) throw new AppError(400, "Razorpay is not configured");
  if (!input.razorpay_order_id || !input.razorpay_payment_id || !input.razorpay_signature) {
    throw new AppError(400, "Missing Razorpay payment verification fields");
  }

  const body = `${input.razorpay_order_id}|${input.razorpay_payment_id}`;
  const expected = crypto.createHmac("sha256", env.razorpayKeySecret).update(body).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(input.razorpay_signature);
  const valid = expectedBuffer.length === receivedBuffer.length && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

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

  if (payment.count === 0) throw new AppError(400, "Razorpay order was not found");

  return { ok: true };
}
