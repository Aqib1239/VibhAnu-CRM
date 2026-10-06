export type Role =
  | "ADMIN"
  | "MARKETING"
  | "COMMUNICATION"
  | "VIGILANCE"
  | "SUPPORT"
  | "SALES";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  department: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export type Permission =
  | "leads:create"
  | "leads:read"
  | "leads:edit_communication"
  | "leads:edit_vigilance"
  | "leads:upload_audio"
  | "leads:allocate_support"
  | "leads:claim_sales"
  | "leads:export"
  | "settings:manage";
