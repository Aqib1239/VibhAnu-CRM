import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/response";
import { env } from "../config/env";

const router = Router();

router.get("/health", (_req: Request, res: Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";

  return ApiResponse.success(
    res,
    {
      status: "healthy",
      service: "Vibh-Anu CRM API",
      environment: env.NODE_ENV,
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    "Vibh-Anu CRM API is running"
  );
});

export default router;
