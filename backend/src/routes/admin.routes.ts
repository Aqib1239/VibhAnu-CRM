import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { validateBody } from "../middleware/validate.middleware";
import { ROLES } from "../constants/roles";
import { createUserValidator, updateUserStatusValidator } from "../validators/auth.validator";

const router = Router();

// Only ADMIN can access /api/admin routes
router.use(requireAuth, requireRole(ROLES.ADMIN));

router.get("/users", AdminController.getUsers);
router.post("/users", validateBody(createUserValidator), AdminController.createUser);
router.patch("/users/:id/status", validateBody(updateUserStatusValidator), AdminController.updateUserStatus);
router.get("/leads", AdminController.getAdminLeads);

export default router;
