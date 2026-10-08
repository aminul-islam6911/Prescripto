import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import { connectRedis } from "./config/redis.js";
import { validateAuthConfiguration } from "./utils/authTokens.js";
import {
  apiRateLimiter,
  initializeRateLimiters,
} from "./middlewares/rateLimiters.js";
import adminRouter from "./routes/adminRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import userRouter from "./routes/userRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// middlewares
app.use(express.json());
app.use(cookieParser());
if (process.env.RENDER === "true" || process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://localhost:5174",
  ...(process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use("/api", apiRateLimiter);

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

const startServer = async () => {
  validateAuthConfiguration();
  await Promise.all([connectDB(), connectRedis()]);
  initializeRateLimiters();
  connectCloudinary();
  app.listen(port, () => console.log("Server started", port));
};

startServer().catch((error) => {
  console.error("Unable to start server:", error);
  process.exitCode = 1;
});
