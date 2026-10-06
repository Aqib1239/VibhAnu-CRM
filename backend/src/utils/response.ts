import { Response } from "express";

export interface ApiResponseData<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, any> | string;
  timestamp?: string;
}

export class ApiResponse {
  static success<T>(res: Response, data: T, message: string = "Success", statusCode: number = 200) {
    const payload: ApiResponseData<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, data: T, message: string = "Created successfully") {
    return this.success(res, data, message, 201);
  }

  static error(
    res: Response,
    message: string = "Internal server error",
    statusCode: number = 500,
    errors?: Record<string, any> | string
  ) {
    const payload: ApiResponseData = {
      success: false,
      message,
      ...(errors ? { errors } : {}),
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  static badRequest(res: Response, message: string = "Bad Request", errors?: any) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res: Response, message: string = "Unauthorized. Please authenticate.") {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message: string = "Forbidden. You do not have permission to perform this action.") {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message: string = "Resource not found") {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message: string = "Conflict. Resource state prevents this action.") {
    return this.error(res, message, 409);
  }

  static unprocessable(res: Response, message: string = "Validation failed", errors?: any) {
    return this.error(res, message, 422, errors);
  }
}
