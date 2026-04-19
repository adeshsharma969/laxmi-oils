import { randomBytes } from "node:crypto";

export function prefixedId(prefix: string, bytes = 6) {
  return `${prefix}_${randomBytes(bytes).toString("hex")}`;
}

export function publicOrderId() {
  return `LX-${randomBytes(4).toString("hex").toUpperCase()}`;
}

export function makeReferralCode(name: string) {
  const prefix = (name || "LAX").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3) || "LAX";
  return `${prefix}${randomBytes(3).toString("hex").toUpperCase()}`;
}
