import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/User.model";
import { ApiResponse } from "../utils/response";
import { logger } from "../config/logger";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && (req.cookies.token || req.cookies.vibhanu_auth_token)) {
      // 2. Check HttpOnly cookie
      token = req.cookies.token || req.cookies.vibhanu_auth_token;
    }

    if (!token) {
      return ApiResponse.unauthorized(res, "Authentication required. No token provided.");
    }

    // 3. Verify token signature & expiration
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        return ApiResponse.unauthorized(res, "Session expired. Please log in again.");
      }
      return ApiResponse.unauthorized(res, "Invalid authentication token.");
    }

    // 4. Load & validate user from database
    const user = await User.findById(decoded.userId).select("+isActive");
    if (!user) {
      return ApiResponse.unauthorized(res, "User account no longer exists.");
    }

    if (!user.isActive) {
      return ApiResponse.forbidden(res, "User account has been deactivated. Please contact administrator.");
    }

    // 5. Attach authenticated user to request
    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      avatar: user.avatar,
      isActive: user.isActive,
    };

    next();
  } catch (err: any) {
    logger.error({ err }, "Authentication middleware error");
    return ApiResponse.unauthorized(res, "Authentication failed.");
  }
}
