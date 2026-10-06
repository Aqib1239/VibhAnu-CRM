import { IAuthUser } from "./auth.types";

declare global {
  namespace Express {
    interface Request {
      user?: IAuthUser;
      requestId?: string;
    }
  }
}

export {};
