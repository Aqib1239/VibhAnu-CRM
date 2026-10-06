import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { loginValidator } from "../validators/auth.validator";

const router = Router();

router.post("/login", authLimiter, validateBody(loginValidator), AuthController.login);
router.get("/me", requireAuth, AuthController.getMe);
router.post("/logout", requireAuth, AuthController.logout);

export default router;
