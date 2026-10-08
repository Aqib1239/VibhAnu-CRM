import { deleteCloudinaryAsset } from "../config/cloudinary";
import { logger } from "../config/logger";

export interface IStoredFile {
  fileName: string;
  storagePath: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface IStorageProvider {
  deleteFile(publicId: string): Promise<boolean>;
}

/**
 * Cloudinary-backed Storage Provider
 * Completely replaces legacy filesystem storage. All media assets are permanently hosted on Cloudinary CDN.
 */
export class CloudinaryStorageService implements IStorageProvider {
  async deleteFile(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    try {
      return await deleteCloudinaryAsset(publicId, "video");
    } catch (err) {
      logger.error({ err, publicId }, "Cloudinary file deletion failed");
      return false;
    }
  }
}

export const storageService = new CloudinaryStorageService();
