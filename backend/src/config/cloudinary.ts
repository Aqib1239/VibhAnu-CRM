import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";
import { logger } from "./logger";

const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  const errMsg =
    "Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your environment.";
  logger.error(errMsg);
  if (env.NODE_ENV === "production") {
    throw new Error(errMsg);
  }
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

/**
 * Safely deletes an audio/media asset from Cloudinary by its public ID.
 * Defaults to resource_type: "video" because Cloudinary manages audio under the video resource type.
 */
export async function deleteCloudinaryAsset(
  publicId: string,
  resourceType: "video" | "image" | "raw" = "video"
): Promise<boolean> {
  if (!publicId) return false;
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
    const isOk = result.result === "ok" || result.result === "not found";
    logger.info({ publicId, resourceType, result: result.result }, "Cloudinary asset destruction executed");
    return isOk;
  } catch (err) {
    logger.error({ err, publicId, resourceType }, "Failed to destroy Cloudinary asset");
    return false;
  }
}

export { cloudinary };