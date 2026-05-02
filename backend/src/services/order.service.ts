import { prisma } from "../prisma/client.js";
import { AppError, toNumber } from "../utils/http.js";
import { publicOrderId } from "../utils/ids.js";
import { resolveCoupon } from "./coupon.service.js";
import { clearCart } from "./cart.service.js";

import { nowIso } from "../utils/time.js";

type OrderInput = {
  items: Array<{
    product_id?: string;
    productId?: string;
    name: string;
    size: string;
    price: number;
    qty: number;
    image?: string;
    bg?: string;
  }>;
  address: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  delivery?: string;
  payment_method?: string;
  payment_id?: string;
  coupon_code?: string | null;
  use_credit?: boolean;
  credit_amount?: number;
};

function toPublicOrder(order: any) {
  return {
    order_id: order.orderId,
    user_id: order.userId,
    email: order.email,
    address: order.address,
    items: order.items.map((item: any) => ({
      product_id: item.productId,
      name: item.name,
      size: item.size,
      price: item.price,
      qty: item.qty,
      image: item.image,
      bg: item.bg,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount,
    credit_used: order.creditUsed,
    total: order.total,
    delivery: order.delivery,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    status: order.status,
    coupon_code: order.couponCode,
    coupon_kind: order.couponKind,
    tracking: order.tracking,
    created_at: order.createdAt,
  };
}

export async function createOrder(input: OrderInput, user?: { user_id: string; rewards_earned?: number }) {
  if (!input.items?.length) throw new AppError(400, "Cart is empty");

  const items = input.items.map((item) => ({
    productId: item.product_id || item.productId,
    name: item.name,
    size: item.size,
    price: toNumber(item.price),
    qty: Math.max(1, Math.trunc(toNumber(item.qty, 1))),
    image: item.image,
    bg: item.bg,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const delivery = input.delivery || "standard";
  const shipping = delivery === "express" ? 79 : subtotal > 499 ? 0 : 49;
  let discount = 0;
  let couponInfo: Record<string, string | undefined> = {};

  if (input.coupon_code) {
    const coupon = await resolveCoupon(input.coupon_code, input.address.email);
    if (coupon.valid) {
      discount = Math.min(toNumber(coupon.discount), subtotal);
      couponInfo = {
        couponCode: coupon.code,
        couponKind: coupon.kind,
        couponReferrerId: coupon.referrer_id,
      };
    }
  }

  let total = Math.max(0, subtotal + shipping - discount);
  let creditUsed = 0;

  if (input.use_credit && user) {
    const balance = Math.max(0, Math.trunc(toNumber(user.rewards_earned, 0)));
    const requested = Math.trunc(toNumber(input.credit_amount, balance));
    creditUsed = Math.min(balance, requested, total);
    total -= creditUsed;
  }

  if (input.payment_method === "razorpay") {
    if (!input.payment_id) throw new AppError(400, "Verified Razorpay payment is required");

    const verifiedPayment = await prisma.payment.findFirst({
      where: {
        razorpayPaymentId: input.payment_id,
        status: "paid",
      },
    });

    if (!verifiedPayment) throw new AppError(400, "Razorpay payment is not verified");
  }

  const order = await prisma.order.create({
    data: {
      orderId: publicOrderId(),
      userId: user?.user_id,
      email: input.address.email.toLowerCase().trim(),
      address: input.address,
      items,
      subtotal,
      shipping,
      discount,
      creditUsed,
      total,
      delivery,
      paymentMethod: input.payment_method || "razorpay_mock",
      paymentStatus: input.payment_method === "cod" ? "pending" : "paid",
      paymentId: input.payment_id,
      status: input.payment_method === "cod" ? "placed" : "paid",
      createdAt: nowIso(),
      updatedAt: nowIso(),
      ...couponInfo,
    },
  });

  if (creditUsed > 0 && user) {
    await prisma.user.update({
      where: { userId: user.user_id },
      data: { rewardsEarned: { decrement: creditUsed } },
    });
  }

  if (couponInfo.couponKind === "referral" && couponInfo.couponReferrerId) {
    await prisma.user.update({
      where: { userId: couponInfo.couponReferrerId },
      data: { rewardsEarned: { increment: 100 } },
    });
  }

  if (user) await clearCart(user.user_id).catch(() => {});

  return toPublicOrder(order);
}

export async function getMyOrders(userId: string) {
  const orders = await prisma.order.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  return orders.map(toPublicOrder);
}

export async function getOrder(orderId: string, user?: { user_id: string; role: string; email?: string }) {
  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order) throw new AppError(404, "Not found");

  if (!user || user.role === "admin" || order.userId === user.user_id || order.email === user.email) {
    return toPublicOrder(order);
  }

  throw new AppError(403, "Forbidden");
}

export async function listOrders() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  return orders.map(toPublicOrder);
}

export async function updateOrderStatus(orderId: string, status: string) {
  if (!["placed", "paid", "packed", "shipped", "delivered", "cancelled"].includes(status)) {
    throw new AppError(400, "Invalid status");
  }

  await prisma.order.update({
    where: { orderId },
    data: {
      status,
      updatedAt: nowIso(),
    },
  }).catch(() => {
    throw new AppError(404, "Not found");
  });

  return { ok: true };
}

export async function updateOrderTracking(orderId: string, trackingData: any) {
  await prisma.order.update({
    where: { orderId },
    data: {
      tracking: trackingData,
      shipmentId: trackingData.trackingId,
      status: "packed", // Automatically mark as packed once tracking is generated
      updatedAt: nowIso(),
    },
  }).catch(() => {
    throw new AppError(404, "Not found");
  });

  return { ok: true };
}

export async function adminStats() {
  const [orders, products, leads, customers, paidOrders] = await Promise.all([
    prisma.order.count(),
    prisma.product.count(),
    prisma.b2BLead.count(),
    prisma.user.count({ where: { OR: [{ role: "user" }, { role: "customer" }] } }),
    prisma.order.findMany({ select: { total: true } }),
  ]);

  const revenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  return { orders, products, leads, customers, revenue };
}

export async function ordersCsv() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10000 });
  const header = [
    "order_id",
    "created_at",
    "status",
    "customer_name",
    "email",
    "phone",
    "city",
    "pincode",
    "items",
    "subtotal",
    "shipping",
    "discount",
    "credit_used",
    "total",
    "delivery",
    "payment_method",
    "coupon_code",
    "tracking_url",
  ];

  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = orders.map((order: any) => {
    const items = order.items.map((item: any) => `${item.name} (${item.size}) x${item.qty}`).join(" | ");
    return [
      order.orderId,
      order.createdAt,
      order.status,
      order.address?.name,
      order.email,
      order.address?.phone,
      order.address?.city,
      order.address?.pincode,
      items,
      order.subtotal,
      order.shipping,
      order.discount,
      order.creditUsed,
      order.total,
      order.delivery,
      order.paymentMethod,
      order.couponCode,
      order.tracking?.trackingUrl,
    ].map(quote).join(",");
  });

  return [header.join(","), ...rows].join("\n");
}
