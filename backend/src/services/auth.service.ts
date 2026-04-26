import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/http.js";
import { makeReferralCode, prefixedId } from "../utils/ids.js";
import { nowIso } from "../utils/time.js";

export type PublicUser = {
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: string;
  picture?: string | null;
  referral_code?: string | null;
  rewards_earned?: number;
};

export type RegisterInput = {
  email: string;
  password: string;
  name: string;
  phone?: string;
  ref?: string;
};

function signToken(userId: string, role: string) {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, { expiresIn: `${env.jwtExpireDays}d` });
}

export function toPublicUser(user: any): PublicUser {
  return {
    user_id: user.userId,
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
    picture: user.picture,
    referral_code: user.referralCode,
    rewards_earned: user.rewardsEarned || 0,
  };
}

async function uniqueReferralCode(name: string) {
  for (let i = 0; i < 8; i += 1) {
    const code = makeReferralCode(name);
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return makeReferralCode("LAX");
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(400, "Email already registered");

  let referredBy: string | undefined;
  if (input.ref) {
    const referrer = await prisma.user.findUnique({ where: { referralCode: input.ref.toUpperCase().trim() } });
    referredBy = referrer?.userId;
  }

  const user = await prisma.user.create({
    data: {
      userId: prefixedId("user"),
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
      name: input.name,
      phone: input.phone,
      role: "user",
      provider: "password",
      referralCode: await uniqueReferralCode(input.name),
      referredBy,
      rewardsEarned: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  });

  const publicUser = toPublicUser(user);
  return { token: signToken(user.userId, user.role), user: publicUser };
}

export async function login(emailInput: string, password: string) {
  const email = emailInput.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !ok) throw new AppError(401, "Invalid email or password");
  if (user.role === "admin") throw new AppError(401, "Invalid email or password");

  const publicUser = toPublicUser(user);
  return { token: signToken(user.userId, user.role), user: publicUser };
}

export async function adminLogin(emailInput: string, password: string) {
  const email = emailInput.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !ok) throw new AppError(401, "Invalid email or password");
  if (user.role !== "admin") throw new AppError(403, "Admin access only");

  const publicUser = toPublicUser(user);
  return { token: signToken(user.userId, user.role), user: publicUser };
}

export async function findPublicUserById(userId: string) {
  const user = await prisma.user.findUnique({ where: { userId } });
  return user ? toPublicUser(user) : null;
}

export async function getReferralSummary(userId: string) {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) throw new AppError(404, "User not found");

  const [signups, redeemed] = await Promise.all([
    prisma.user.count({ where: { referredBy: userId } }),
    prisma.order.count({ where: { couponKind: "referral", couponReferrerId: userId } }),
  ]);

  return {
    referral_code: user.referralCode,
    signups,
    orders_redeemed: redeemed,
    rewards_earned: user.rewardsEarned || 0,
    share_message: `Try Laxmi's wood-pressed oils - use my code ${user.referralCode} for Rs.100 off your first order.`,
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return users.map(toPublicUser);
}

export async function updateUserRole(userId: string, role: string) {
  if (!["admin", "user"].includes(role)) throw new AppError(400, "Invalid role");
  const user = await prisma.user.update({ where: { userId }, data: { role, updatedAt: nowIso() } });
  return toPublicUser(user);
}
