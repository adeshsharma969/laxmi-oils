import { prisma } from "../prisma/client.js";
import { nowIso } from "../utils/time.js";

function mapLegacyStatus(status: string) {
  if (status === "packed") return { orderStatus: "shipment_created", shipmentStatus: "created" };
  if (status === "shipped") return { orderStatus: "shipped", shipmentStatus: "in_transit" };
  if (status === "delivered") return { orderStatus: "delivered", shipmentStatus: "delivered" };
  if (status === "cancelled") return { orderStatus: "cancelled", shipmentStatus: "failed" };
  return { orderStatus: "pending_verification", shipmentStatus: "not_created" };
}

async function run() {
  const orders = await prisma.order.findMany({
    select: {
      id: true,
      orderId: true,
      status: true,
      shipmentId: true,
      tracking: true,
      paymentStatus: true,
      orderStatus: true,
      shipmentStatus: true,
      isVerified: true,
    },
    take: 100000,
  });

  for (const order of orders) {
    const mapped = mapLegacyStatus(order.status || "paid");
    await prisma.order.update({
      where: { id: order.id },
      data: {
        orderStatus: order.orderStatus || mapped.orderStatus,
        shipmentStatus: order.shipmentStatus || (order.shipmentId ? "created" : mapped.shipmentStatus),
        isVerified: Boolean(order.isVerified) || (order.paymentStatus === "paid" && order.status !== "placed"),
        awbCode: (order as any).awbCode || (order.tracking as any)?.trackingId || null,
        courierName: (order as any).courierName || (order.tracking as any)?.courier || null,
        trackingUrl: (order as any).trackingUrl || (order.tracking as any)?.trackingUrl || null,
        updatedAt: nowIso(),
      },
    });
  }

  console.log(`Backfilled ${orders.length} orders`);
}

run()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
