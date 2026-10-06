import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { ApiResponse } from "../utils/response";
import { env } from "../config/env";

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const { user, token } = await AuthService.login(email, password);

      // Set secure HttpOnly cookie
      res.cookie("vibhanu_auth_token", token, {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return ApiResponse.success(
        res,
        { user, token },
        `Welcome back, ${user.name}! Logged in as ${user.role}.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return ApiResponse.unauthorized(res);
      }
      const user = await AuthService.getMe(req.user.id);
      return ApiResponse.success(res, { user });
    } catch (err) {
      next(err);
    }
  }

  static async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("vibhanu_auth_token", {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: env.NODE_ENV === "production" ? "strict" : "lax",
      });

      return ApiResponse.success(res, null, "Logged out successfully");
    } catch (err) {
      next(err);
    }
  }
}
