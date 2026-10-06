import { app } from "../src/app";
import { connectDatabase } from "../src/config/database";

/**
 * Vercel Serverless Function entry point.
 * Ensures database connectivity for API requests and forwards to Express app.
 */
export default async function handler(req: any, res: any) {
  // Direct root ping, health check, and favicon never wait for database
  if (req.url === "/" || req.url === "/api/health" || req.url === "/favicon.ico") {
    return app(req, res);
  }

  try {
    await connectDatabase();
  } catch (err: any) {
    console.error("Vercel Serverless DB Connection Warning:", err);
  }

  return app(req, res);
}

export { app };
