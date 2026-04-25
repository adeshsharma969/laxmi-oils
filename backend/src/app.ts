import "./config/env.js";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.js";
import { apiRoutes } from "./routes/index.js";

export const app = express();

const allowedOrigins = env.clientOrigin.split(",").map((origin) => origin.trim());

app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", async (_req, res) => {
  try {
    await prisma.$connect();
    await prisma.$disconnect();
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      database: "disconnected",
      error: error instanceof Error ? error.message : "Database connection failed"
    });
  }
});
app.use("/api", apiRoutes);
app.use(notFound);
app.use(errorHandler);
