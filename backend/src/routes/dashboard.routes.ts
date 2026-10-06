import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", DashboardController.getStats);

export default router;
