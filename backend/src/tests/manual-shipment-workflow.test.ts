import test from "node:test";
import assert from "node:assert/strict";
import { hasExistingShipment } from "../services/shipping/shipping.service.js";
import { mapLegacyToOrderStatus, mapOrderToLegacyStatus } from "../services/order.service.js";

test("no shipment exists after payment by default mapping", () => {
  const orderStatus = mapLegacyToOrderStatus("paid");
  assert.equal(orderStatus, "pending_verification");
  assert.equal(hasExistingShipment({ shipmentStatus: "not_created", shipmentId: null }), false);
});

test("manual shipment creation state maps to shipment_created", () => {
  assert.equal(mapLegacyToOrderStatus("packed"), "shipment_created");
  assert.equal(mapOrderToLegacyStatus("shipment_created"), "packed");
});

test("duplicate shipment prevention detects existing shipment id", () => {
  assert.equal(hasExistingShipment({ shipmentStatus: "not_created", shipmentId: "1234" }), true);
});

test("shipped and delivered status mappings remain backward compatible", () => {
  assert.equal(mapLegacyToOrderStatus("shipped"), "shipped");
  assert.equal(mapLegacyToOrderStatus("delivered"), "delivered");
  assert.equal(mapOrderToLegacyStatus("shipped"), "shipped");
  assert.equal(mapOrderToLegacyStatus("delivered"), "delivered");
});
