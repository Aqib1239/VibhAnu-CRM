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
    if (process.env.VERCEL) {
      this.baseDir = require("os").tmpdir();
    } else {
      this.baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
      try {
        if (!fs.existsSync(this.baseDir)) {
          fs.mkdirSync(this.baseDir, { recursive: true });
        }
      } catch (err) {
        logger.warn({ err }, "Could not create configured baseDir, falling back to os.tmpdir()");
        this.baseDir = require("os").tmpdir();
      }
    }
  }

  /**
   * Resolves and verifies that the file path is strictly within the allowed upload directory
   * to completely prevent path traversal attacks (e.g. ../../etc/passwd)
   */
  getFilePath(storagePath: string): string | null {
    if (!storagePath) return null;

    const baseName = path.basename(storagePath);
    const candidateDirs = [
      this.baseDir,
      path.resolve(__dirname, "../../uploads"),
      path.resolve(process.cwd(), "uploads"),
      path.resolve(process.cwd(), "backend/uploads"),
    ];

    for (const dir of candidateDirs) {
      if (!dir) continue;
      const candidate = path.resolve(dir, baseName);
      if (candidate.startsWith(dir) && fs.existsSync(candidate)) {
        return candidate;
      }
    }

    return null;
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
