import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { LeadService } from "../services/lead.service";
import { storageService } from "../services/storage.service";
import { ApiResponse } from "../utils/response";
import { IAudioMetadata } from "../types/lead.types";

export class AudioController {
  /**
   * Upload and attach audio to a vigilance lead
   */
  static async uploadAudio(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, "No audio file uploaded.");
      }

      const file = req.file;
      const leadId = req.params.id;
      const user = req.user!;

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
        url: `/api/leads/${leadId}/audio`,
        storagePath: file.filename,
        mimeType: file.mimetype || "audio/mpeg",
        uploadedBy: `${user.name} (${user.role})`,
        uploadedAt: new Date().toISOString(),
        waveformSample,
      };

      const lead = await LeadService.attachAudio(leadId, audioMeta, user);

      return ApiResponse.created(
        res,
        { audio: lead.vigilanceDetails?.audio, lead },
        "Call verification recording uploaded and attached successfully."
      );
    } catch (err) {
      next(err);
    }
  }

  /**
   * Securely stream/serve lead audio recording with HTTP range support
   */
  static async getAudio(req: Request, res: Response, next: NextFunction) {
    try {
      const leadId = req.params.id;
      const user = req.user!;

      // Verify user has permission to access this lead
      const lead = await LeadService.getLeadById(leadId, user);
      const audioMeta = lead.vigilanceDetails?.audio;

      if (!audioMeta || !audioMeta.storagePath) {
        return ApiResponse.notFound(res, "Audio recording not found for this lead.");
      }

      const filePath = storageService.getFilePath(audioMeta.storagePath);
      if (!filePath) {
        return ApiResponse.notFound(res, "Audio file on disk is not accessible.");
      }

      const stat = fs.statSync(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;

      const mimeType = audioMeta.mimeType || "audio/mpeg";

      if (range) {
        // HTTP 206 Partial Content for byte-range seekable streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = end - start + 1;
        const stream = fs.createReadStream(filePath, { start, end });

        const head = {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunksize,
          "Content-Type": mimeType,
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        };

        res.writeHead(206, head);
        stream.pipe(res);
      } else {
        // Standard full file response
        const head = {
          "Content-Length": fileSize,
          "Content-Type": mimeType,
          "Accept-Ranges": "bytes",
          "Cache-Control": "private, no-cache, no-store, must-revalidate",
        };

        res.writeHead(200, head);
        fs.createReadStream(filePath).pipe(res);
      }
    } catch (err) {
      next(err);
    }
  }
}
