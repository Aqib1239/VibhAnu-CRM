import { Request, Response, NextFunction } from "express";
import { DashboardService } from "../services/dashboard.service";
import { ApiResponse } from "../utils/response";

export class DashboardController {
  static async getStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getDashboardStats();
      return ApiResponse.success(res, stats, "Dashboard metrics retrieved successfully");
    } catch (err) {
      next(err);
    }
  }
}
