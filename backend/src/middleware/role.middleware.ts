import { Request, Response, NextFunction } from "express";
import { ROLES, UserRole } from "../constants/roles";
import { ApiResponse } from "../utils/response";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, "Authentication required.");
    }

    // ADMIN always has global system privileges
    if (req.user.role === ROLES.ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.forbidden(
        res,
        `Forbidden: Role '${req.user.role}' is not authorized to access this workflow resource.`
      );
    }

    next();
  };
}
