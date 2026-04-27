import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL && process.env.MONGO_URL) {
  process.env.DATABASE_URL = process.env.MONGO_URL;
}

const defaultClientOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://laxmiedibleoils.com",
  "https://www.laxmiedibleoils.com",
];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 8000),
  clientOrigin: process.env.CLIENT_ORIGIN || defaultClientOrigins.join(","),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "development-only-change-me",
  jwtExpireDays: Number(process.env.JWT_EXPIRE_DAYS || 7),
  adminEmail: (process.env.ADMIN_EMAIL || "admin@laxmioils.com").toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || "laxmi@admin2026",
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || "",
  shiprocketEmail: process.env.SHIPROCKET_EMAIL || "",
  shiprocketPassword: process.env.SHIPROCKET_PASSWORD || "",
  delhiveryApiToken: process.env.DELHIVERY_API_TOKEN || "",
};

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required. You can reuse the previous MONGO_URL value as DATABASE_URL.");
}
