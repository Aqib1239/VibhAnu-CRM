import { Request, Response, NextFunction } from "express";
import { LeadService } from "../services/lead.service";
import { ApiResponse } from "../utils/response";

export class LeadController {
  static async createLead(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.createLead(req.body, req.user!);
      return ApiResponse.created(
        res,
        { lead },
        `Lead ${lead.leadCode} created successfully and transferred to Communication queue.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async getLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await LeadService.getLeads(req.query as any, req.user!);
      return ApiResponse.success(res, result, "Leads retrieved successfully");
    } catch (err) {
      next(err);
    }
  }

  static async getLeadById(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.getLeadById(req.params.id, req.user!);
      return ApiResponse.success(res, { lead }, "Lead details retrieved successfully");
    } catch (err) {
      next(err);
    }
  }

  static async scheduleMeeting(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.scheduleMeeting(req.params.id, req.body, req.user!);
      return ApiResponse.success(
        res,
        { lead },
        `Meeting scheduled for ${lead.date} at ${lead.time}. Transferred to Vigilance audit.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async verifyVigilance(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.verifyVigilance(req.params.id, req.body, req.user!);
      return ApiResponse.success(
        res,
        { lead },
        `Vigilance audit verified and recording attached. Moved to Support.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async allocateSupport(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.allocateSupport(req.params.id, req.body, req.user!);
      return ApiResponse.success(
        res,
        { lead },
        `3-point verification confirmed. Lead allocated to Sales queue.`
      );
    } catch (err) {
      next(err);
    }
  }

  static async claimSales(req: Request, res: Response, next: NextFunction) {
    try {
      const lead = await LeadService.claimSales(req.params.id, req.body, req.user!);
      return ApiResponse.success(
        res,
        { lead },
        `Lead ${lead.leadCode} successfully claimed by ${req.user!.name}!`
      );
    } catch (err) {
      next(err);
    }
  }
}
