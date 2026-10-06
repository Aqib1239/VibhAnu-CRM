import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { LeadService } from "../services/lead.service";
import { ApiResponse } from "../utils/response";

export class AdminController {
  static async getUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();
      return ApiResponse.success(res, { users }, "Users retrieved successfully");
    } catch (err) {
      next(err);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await UserService.createUser(req.body);
      return ApiResponse.created(res, { user }, `User ${user.name} created successfully.`);
    } catch (err) {
      next(err);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const user = await UserService.updateUserStatus(id, isActive);
      return ApiResponse.success(
        res,
        { user },
        `User ${user.name} status updated to ${isActive ? "Active" : "Inactive"}.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async getAdminLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LeadService.getLeads(req.query as any, req.user!);
      return ApiResponse.success(res, result, "Global lead audit log retrieved successfully");
    } catch (err) {
      next(err);
    }
  }
}
