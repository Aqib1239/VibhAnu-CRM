import { Router } from "express";
import { LeadController } from "../controllers/lead.controller";
import { AudioController } from "../controllers/audio.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody, validateQuery } from "../middleware/validate.middleware";
import { audioUpload } from "../middleware/upload.middleware";
import { uploadLimiter } from "../middleware/rateLimit.middleware";
import { ROLES } from "../constants/roles";
import {
  createLeadValidator,
  scheduleMeetingValidator,
  verifyVigilanceValidator,
  allocateSupportValidator,
  claimSalesValidator,
} from "../validators/lead.validator";
import { leadQueryValidator } from "../validators/query.validator";

const router = Router();

// Apply requireAuth to all lead endpoints
router.use(requireAuth);

// 1. Create Lead (MARKETING / ADMIN)
router.post(
  "/",
  requireRole(ROLES.MARKETING, ROLES.ADMIN),
  validateBody(createLeadValidator),
  LeadController.createLead
);

// 2. List Leads (Filtered with RBAC)
router.get("/", validateQuery(leadQueryValidator), LeadController.getLeads);

// 3. Audio endpoints
router.post(
  "/:id/audio",
  requireRole(ROLES.VIGILANCE, ROLES.ADMIN),
  uploadLimiter,
  audioUpload.single("audio"),
  AudioController.uploadAudio
);
router.get("/:id/audio", AudioController.getAudio);

// 4. Workflow Transition: Communication -> Vigilance
router.post(
  "/:id/meeting",
  requireRole(ROLES.COMMUNICATION, ROLES.ADMIN),
  validateBody(scheduleMeetingValidator),
  LeadController.scheduleMeeting
);

// 5. Workflow Transition: Vigilance -> Support
router.post(
  "/:id/verify",
  requireRole(ROLES.VIGILANCE, ROLES.ADMIN),
  validateBody(verifyVigilanceValidator),
  LeadController.verifyVigilance
);

// 6. Workflow Transition: Support -> Sales
router.post(
  "/:id/allocate",
  requireRole(ROLES.SUPPORT, ROLES.ADMIN),
  validateBody(allocateSupportValidator),
  LeadController.allocateSupport
);

// 7. Workflow Transition: Sales -> Claimed
router.post(
  "/:id/claim",
  requireRole(ROLES.SALES, ROLES.ADMIN),
  validateBody(claimSalesValidator),
  LeadController.claimSales
);

// 8. Lead Details by ID
router.get("/:id", LeadController.getLeadById);

export default router;
