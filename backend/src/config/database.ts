import mongoose from "mongoose";
import { env } from "./env";
import { logger } from "./logger";

let isConnected = false;
let memoryServer: any = null;

export async function connectDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  mongoose.connection.on("connected", () => {
    isConnected = true;
    logger.info("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });

  mongoose.connection.on("disconnected", () => {
    isConnected = false;
    logger.warn("MongoDB disconnected");
  });

  try {
    // Attempt standard connection to configured MONGO_URI
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000,
      autoIndex: true,
    };

    logger.info("Connecting to MongoDB Atlas...");
    const connStartTime = Date.now();
    const conn = await mongoose.connect(env.MONGO_URI, options);
    isConnected = true;
    const connDuration = Date.now() - connStartTime;
    logger.info(`[DB] Atlas connection established: ${connDuration}ms (pool min: 2, max: 10)`);
    return conn;
  } catch (err: any) {
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
