import { prisma } from "../prisma/client.js";

export async function resolveCoupon(codeInput: string, emailInput?: string | null) {
  const code = (codeInput || "").toUpperCase().trim();
  const email = emailInput?.toLowerCase().trim();

  if (!code) return { valid: false, discount: 0, reason: "Empty code" };

  if (code === "LAXMI100") {
    if (email) {
      const previous = await prisma.order.count({ where: { email } });
      if (previous > 0) {
        return { valid: false, discount: 0, reason: "LAXMI100 is only valid on your first order" };
      }
    }

    return { valid: true, discount: 100, kind: "first_order", code };
  }

  const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
  if (referrer) {
    if (email && referrer.email === email) {
      return { valid: false, discount: 0, reason: "You can't use your own referral code" };
    }

    return {
      valid: true,
      discount: 100,
      kind: "referral",
      code,
      referrer_id: referrer.userId,
    };
  }

  return { valid: false, discount: 0, reason: "Invalid code" };
}
