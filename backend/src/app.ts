import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { loggingMiddleware } from "./middleware/logging.middleware";
import { generalLimiter } from "./middleware/rateLimit.middleware";
import { errorMiddleware, notFoundHandler } from "./middleware/error.middleware";
import apiRouter from "./routes";

export function createApp(): Express {
  const app = express();

  // 1. Security Headers via Helmet
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Managed by Next.js on frontend
    })
  );

  // 2. CORS Configuration
  const allowedOrigins = env.CLIENT_URL.split(",").map((url) => url.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === "development") {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy does not allow access from origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id", "Range"],
      exposedHeaders: ["X-Request-Id", "Content-Range", "Accept-Ranges"],
    })
  );

  // 3. Body & Cookie Parsing
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));
  app.use(cookieParser());

  // 4. Request ID & Structured Logging
  app.use(requestIdMiddleware);
  app.use(loggingMiddleware);

  // 5. Rate Limiting
  app.use("/api", generalLimiter);

  // 6. Mount API Routes
  app.use("/api", apiRouter);

  // 7. Not Found & Error Handling
  app.use(notFoundHandler);
  app.use(errorMiddleware);

  return app;
}

export const app = createApp();
