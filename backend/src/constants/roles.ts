export const ROLES = {
  ADMIN: "ADMIN",
  MARKETING: "MARKETING",
  COMMUNICATION: "COMMUNICATION",
  VIGILANCE: "VIGILANCE",
  SUPPORT: "SUPPORT",
  SALES: "SALES",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  LEADS_CREATE: "leads:create",
  LEADS_READ: "leads:read",
  LEADS_EDIT_COMMUNICATION: "leads:edit_communication",
  LEADS_EDIT_VIGILANCE: "leads:edit_vigilance",
  LEADS_UPLOAD_AUDIO: "leads:upload_audio",
  LEADS_ALLOCATE_SUPPORT: "leads:allocate_support",
  LEADS_CLAIM_SALES: "leads:claim_sales",
  LEADS_EXPORT: "leads:export",
  SETTINGS_MANAGE: "settings:manage",
  USERS_MANAGE: "users:manage",
} as const;

export type PermissionType = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export interface RoleDefinition {
  id: UserRole;
  name: string;
  badgeLabel: string;
  description: string;
  allowedDepartments: string[];
  permissions: PermissionType[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  ADMIN: {
    id: "ADMIN",
    name: "System Administrator",
    badgeLabel: "Admin",
    description: "Full visibility across all departments and global CRM control.",
    allowedDepartments: ["marketing", "communication", "vigilance", "support", "sales", "claimed"],
    permissions: [
      "leads:create",
      "leads:read",
      "leads:edit_communication",
      "leads:edit_vigilance",
      "leads:upload_audio",
      "leads:allocate_support",
      "leads:claim_sales",
      "leads:export",
      "settings:manage",
      "users:manage",
    ],
  },
  MARKETING: {
    id: "MARKETING",
    name: "Marketing Executive",
    badgeLabel: "Marketing",
    description: "Captures new leads and enters them into the pipeline.",
    allowedDepartments: ["marketing"],
    permissions: ["leads:create", "leads:read"],
  },
  COMMUNICATION: {
    id: "COMMUNICATION",
    name: "Communication Specialist",
    badgeLabel: "Communication",
    description: "Initiates contact, schedules meetings, and moves leads to Vigilance.",
    allowedDepartments: ["communication"],
    permissions: ["leads:read", "leads:edit_communication"],
  },
  VIGILANCE: {
    id: "VIGILANCE",
    name: "Vigilance Officer",
    badgeLabel: "Vigilance",
    description: "Verifies lead details and uploads mandatory verification audio call records.",
    allowedDepartments: ["vigilance"],
    permissions: ["leads:read", "leads:edit_vigilance", "leads:upload_audio"],
  },
  SUPPORT: {
    id: "SUPPORT",
    name: "Support Coordinator",
    badgeLabel: "Support",
    description: "Performs final checks (Date, Time, Address) and allocates to Sales.",
    allowedDepartments: ["support"],
    permissions: ["leads:read", "leads:allocate_support"],
  },
  SALES: {
    id: "SALES",
    name: "Sales Executive",
    badgeLabel: "Sales",
    description: "Listens to complete verification audio recording and claims leads.",
    allowedDepartments: ["sales", "claimed"],
    permissions: ["leads:read", "leads:claim_sales"],
  },
};
