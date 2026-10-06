import pino from "pino";
import { env } from "./env";

const isProduction =
  env.NODE_ENV === "production" || process.env.VERCEL === "1";

const logger = pino({
  level: isProduction ? "info" : "debug",

  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }),

  redact: {
    paths: [
      "req.headers.authorization",
      "password",
      "token",
      "jwt",
      "*.password",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
});

export { logger };