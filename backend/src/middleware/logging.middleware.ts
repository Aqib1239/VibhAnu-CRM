import { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logData = {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs: duration,
      userId: req.user?.id,
      role: req.user?.role,
    };

    if (process.env.NODE_ENV !== "production") {
      console.log(`[API] ${req.method} ${req.originalUrl || req.url} ${res.statusCode} in ${duration}ms`);
    }

    if (res.statusCode >= 500) {
      logger.error(logData, "HTTP Request Server Error");
    } else if (res.statusCode >= 400) {
      logger.warn(logData, "HTTP Request Client Error");
    } else {
      logger.info(logData, "HTTP Request Handled");
    }
  });

  next();
}
