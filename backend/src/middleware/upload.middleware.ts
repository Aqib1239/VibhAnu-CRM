import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { Request } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/aac",
  "audio/x-m4a",
  "audio/m4a",
  "audio/flac",
]);

const ALLOWED_EXTENSIONS = new Set([".mp3", ".wav", ".ogg", ".webm", ".mp4", ".m4a", ".aac", ".flac"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Request, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : ".mp3";
    const leadId = req.params.id || "lead";
    const sanitizedLeadId = leadId.replace(/[^a-zA-Z0-9-_]/g, "_");
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const safeFilename = `audio_${sanitizedLeadId}_${uniqueSuffix}${ext}`;
    cb(null, safeFilename);
  },
});

export const audioUpload = multer({
  storage,
  limits: {
    fileSize: env.MAX_AUDIO_FILE_SIZE,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();

    if (!ALLOWED_MIME_TYPES.has(mime) && !ALLOWED_EXTENSIONS.has(ext)) {
      logger.warn({ mime, ext, originalName: file.originalname }, "Rejected non-audio file upload");
      return cb(new Error("Invalid audio file format. Allowed formats: MP3, WAV, OGG, WEBM, M4A, AAC, FLAC."));
    }

    cb(null, true);
  },
});
