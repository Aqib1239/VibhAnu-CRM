import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

let isConnected = false;
let memoryServer: any = null;
let cachedPromise: Promise<typeof mongoose> | null = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  // Reuse existing active connection in serverless environment
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  // Avoid creating multiple concurrent connection attempts
  if (cachedPromise) {
    return cachedPromise;
  }

  mongoose.connection.on("connected", () => {
    isConnected = true;
    logger.info("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
    cachedPromise = null;
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    logger.warn("MongoDB disconnected");
    cachedPromise = null;
  });

  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      env.MONGODB_URI ||
      env.MONGO_URI;

    if (!mongoUri && env.NODE_ENV !== "test") {
      logger.error("Neither MONGODB_URI nor MONGO_URI is set in environment variables");
      throw new Error("Missing MONGODB_URI / MONGO_URI environment variable");
    }

    // Attempt standard connection to configured MongoDB Atlas cluster
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      maxIdleTimeMS: 30000,
      autoIndex: true,
    };

    logger.info("Connecting to MongoDB Atlas...");
    const connStartTime = Date.now();
    cachedPromise = mongoose.connect(mongoUri, options);
    const conn = await cachedPromise;
    isConnected = true;
    const connDuration = Date.now() - connStartTime;
    logger.info(`[DB] Atlas connection established: ${connDuration}ms (pool min: 1, max: 10)`);
    return conn;
  } catch (err: any) {
    cachedPromise = null;
    logger.error({ err: err.message }, "Could not connect to MongoDB Atlas");

    // Only in test environment (Jest) allow in-memory fallback
    if (env.NODE_ENV === "test") {
      try {
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        logger.info("Spinning up embedded in-memory MongoDB server for testing...");
        memoryServer = await MongoMemoryServer.create();
        const uri = memoryServer.getUri();
        const conn = await mongoose.connect(uri, { autoIndex: true });
        isConnected = true;
        return conn;
      } catch (memErr: any) {
        logger.error({ err: memErr }, "Failed to start in-memory MongoDB fallback for testing");
        throw err;
      }
    } else {
      throw err;
    }
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info("MongoDB disconnected gracefully");
  }

  if (memoryServer) {
    await memoryServer.stop();
    logger.info("In-memory MongoDB server stopped");
  }
}
