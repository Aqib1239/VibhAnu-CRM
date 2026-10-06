import path from "path";
import fs from "fs";
import { env } from "../config/env";
import { logger } from "../config/logger";

export interface IStoredFile {
  fileName: string;
  storagePath: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  getFilePath(storagePath: string): string | null;
  deleteFile(storagePath: string): Promise<boolean>;
  getFileStream(storagePath: string): fs.ReadStream | null;
}

export class LocalStorageService implements IStorageProvider {
  private baseDir: string;

  constructor() {
    this.baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  /**
   * Resolves and verifies that the file path is strictly within the allowed upload directory
   * to completely prevent path traversal attacks (e.g. ../../etc/passwd)
   */
  getFilePath(storagePath: string): string | null {
    if (!storagePath) return null;

    // Sanitize and resolve full path
    const resolvedPath = path.resolve(this.baseDir, path.basename(storagePath));

    // Ensure resolved path starts with baseDir
    if (!resolvedPath.startsWith(this.baseDir)) {
      logger.warn({ storagePath, resolvedPath }, "Path traversal attempt detected");
      return null;
    }

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    return resolvedPath;
  }

  getFileStream(storagePath: string): fs.ReadStream | null {
    const fullPath = this.getFilePath(storagePath);
    if (!fullPath) return null;
    return fs.createReadStream(fullPath);
  }

  async deleteFile(storagePath: string): Promise<boolean> {
    const fullPath = this.getFilePath(storagePath);
    if (!fullPath) return false;
    try {
      await fs.promises.unlink(fullPath);
      return true;
    } catch (err) {
      logger.error({ err, storagePath }, "Failed to delete storage file");
      return false;
    }
  }
}

export const storageService = new LocalStorageService();
