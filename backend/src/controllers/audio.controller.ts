import { Request, Response, NextFunction } from "express";
import { LeadService } from "../services/lead.service";
import { ApiResponse } from "../utils/response";
import { IAudioMetadata } from "../types/lead.types";
import { deleteCloudinaryAsset } from "../config/cloudinary";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { Lead } from "../models/Lead.model";

export class AudioController {
  /**
   * Upload and attach audio to a vigilance lead directly via Cloudinary storage.
   */
  static async uploadAudio(req: Request, res: Response, next: NextFunction) {
    let newlyUploadedPublicId: string | undefined;
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, "No audio file uploaded.");
      }

      // multer-storage-cloudinary augments req.file with Cloudinary fields.
      // `path`    → full HTTPS URL (res.cloudinary.com/...)
      // `filename`→ Cloudinary public_id
      const file = req.file as Express.Multer.File & {
        path: string;
        filename: string;
        secure_url?: string;
        public_id?: string;
      };

      const secureUrl = file.secure_url || file.path;
      const publicId = file.public_id || file.filename;
      newlyUploadedPublicId = publicId;

      if (!secureUrl) {
        logger.error({ file }, "Cloudinary upload did not produce a valid URL");
        return ApiResponse.error(res, "Audio upload failed: Cloudinary did not return a valid URL.", 500);
      }

      const leadId = req.params.id;
      const user = req.user!;

      // Inspect lead beforehand to track previous audio for clean replacement
      const existingLead = await LeadService.getLeadById(leadId, user);
      const previousStoragePath = existingLead?.vigilanceDetails?.audio?.storagePath;

      // Synthetic deterministic waveform sample for visualization
      const waveformSample = Array.from({ length: 56 }, (_, i) => {
        const v = Math.abs(Math.sin(i * 0.63) * 0.55 + Math.cos(i * 0.27 + 1.3) * 0.45);
        return Math.round(22 + v * 78);
      });

      const audioMeta: IAudioMetadata = {
        id: `aud_${Date.now()}`,
        fileName: file.originalname,
        originalName: file.originalname,
        fileSize: file.size,
        duration: 180,
        url: secureUrl,
        storagePath: publicId,
        publicId,
        resourceType: "video",
        mimeType: file.mimetype || "audio/mpeg",
        uploadedBy: `${user.name} (${user.role})`,
        uploadedAt: new Date().toISOString(),
        waveformSample,
      };

      const lead = await LeadService.attachAudio(leadId, audioMeta, user);

      // If replacing an existing Cloudinary asset, clean up the previous file now that MongoDB is saved
      if (
        previousStoragePath &&
        previousStoragePath !== publicId &&
        (previousStoragePath.startsWith("vibhanu-crm/audio/") || previousStoragePath.startsWith("audio_")) &&
        !previousStoragePath.endsWith(".wav") &&
        !previousStoragePath.endsWith(".mp3")
      ) {
        deleteCloudinaryAsset(previousStoragePath).catch((err) => {
          logger.warn({ err, previousStoragePath }, "Background cleanup of replaced Cloudinary audio failed");
        });
      }

      logger.info({ leadId, publicId, secureUrl }, "Audio uploaded and attached to lead successfully");

      return ApiResponse.created(
        res,
        { audio: lead.vigilanceDetails?.audio, lead },
        "Call verification recording uploaded and attached successfully."
      );
    } catch (err) {
      // If MongoDB persistence failed, clean up the orphaned asset from Cloudinary
      if (newlyUploadedPublicId) {
        deleteCloudinaryAsset(newlyUploadedPublicId).catch(() => {});
      }
      next(err);
    }
  }

  /**
   * Redirect to the Cloudinary CDN URL for the lead's audio.
   *
   * Cloudinary's CDN natively supports:
   *  - HTTP Range requests (206 Partial Content) for seeking
   *  - Proper Content-Type streaming
   *  - Global edge CDN caching
   * The browser <audio> tag follows the 302 redirect natively.
   */
  static async getAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = req.params.id;
      const user = req.user!;

      // Verify user has permission to access this lead
      const lead = await LeadService.getLeadById(leadId, user);
      const audioMeta = lead.vigilanceDetails?.audio;

      if (!audioMeta || !audioMeta.url) {
        return ApiResponse.notFound(res, "Audio recording not found for this lead.");
      }

      // ── Case 1: Direct Cloudinary HTTPS URL (new uploads) ─────────────
      if (audioMeta.url.startsWith("https://res.cloudinary.com/")) {
        return res.redirect(302, audioMeta.url);
      }

      // ── Case 2: Stored Cloudinary public_id with relative or older URL ─
      const cloudName = env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME;
      const publicId = audioMeta.publicId || audioMeta.storagePath;

      if (
        cloudName &&
        publicId &&
        (publicId.startsWith("vibhanu-crm/audio/") ||
          (publicId.startsWith("audio_") && !publicId.endsWith(".wav") && !publicId.endsWith(".mp3")))
      ) {
        const cdnUrl = `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}`;
        return res.redirect(302, cdnUrl);
      }

      // ── Case 3: Truly missing / legacy local disk-only record ─────────
      return ApiResponse.notFound(
        res,
        "Audio recording file is unavailable. The recording was stored locally in a previous version and must be re-uploaded."
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Delete audio recording from Cloudinary and remove from MongoDB lead document.
   */
  static async deleteAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = req.params.id;
      const user = req.user!;

      const lead = await LeadService.getLeadById(leadId, user);
      if (!lead) {
        return ApiResponse.notFound(res, "Lead not found");
      }

      const audioMeta = lead.vigilanceDetails?.audio;
      if (!audioMeta) {
        return ApiResponse.notFound(res, "No audio recording found to delete for this lead.");
      }

      const storagePath = audioMeta.publicId || audioMeta.storagePath;
      if (storagePath) {
        await deleteCloudinaryAsset(storagePath);
      }

      const updatedLead = await Lead.findOneAndUpdate(
        { _id: lead._id },
        { $unset: { "vigilanceDetails.audio": 1 } },
        { new: true }
      );

      logger.info({ leadId, storagePath }, "Audio deleted from Cloudinary and unlinked from lead");

      return ApiResponse.success(res, { lead: updatedLead }, "Audio recording deleted successfully.");
    } catch (err) {
      next(err);
    }
  }
}