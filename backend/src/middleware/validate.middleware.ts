import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { ApiResponse } from "../utils/response";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          const field = e.path.join(".");
          errors[field || "general"] = e.message;
        });
        return ApiResponse.unprocessable(res, "Validation failed", errors);
      }
      return ApiResponse.badRequest(res, "Invalid request payload");
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors: Record<string, string> = {};
        err.errors.forEach((e) => {
          const field = e.path.join(".");
          errors[field || "general"] = e.message;
        });
        return ApiResponse.unprocessable(res, "Invalid query parameters", errors);
      }
      return ApiResponse.badRequest(res, "Invalid query parameters");
    }
  };
}
