import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load .env file
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z
    .string()
    .default("5000")
    .transform((val) => parseInt(val, 10)),
  MONGO_URI: z.string().min(1, "MONGO_URI is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters").default("vibhanu_crm_super_secure_jwt_secret_key_2026_dev_prod"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CLIENT_URL: z.string().default("http://localhost:3000"),
  UPLOAD_DIR: z.string().default("./uploads"),
  MAX_AUDIO_FILE_SIZE: z
    .string()
    .default("15728640")
    .transform((val) => parseInt(val, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(result.error.format(), null, 2));
    throw new Error("Invalid environment configuration. Check your .env file.");
  }

  return result.data;
}

export const env = validateEnv();
