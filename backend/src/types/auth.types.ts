import { UserRole } from "../constants/roles";

export interface IUserTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  department: string;
}

export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar?: string;
  isActive: boolean;
}
