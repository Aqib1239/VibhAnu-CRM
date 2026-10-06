import { Role, Permission } from "@/types/auth";

export interface RoleConfig {
  id: Role;
  name: string;
  badgeLabel: string;
  description: string;
  allowedDepartments: string[];
  permissions: Permission[];
  color: string;
}

export const ROLE_CONFIGS: Record<Role, RoleConfig> = {
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
    ],
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  },
  MARKETING: {
    id: "MARKETING",
    name: "Marketing Executive",
    badgeLabel: "Marketing",
    description: "Captures new leads and enters them into the pipeline.",
    allowedDepartments: ["marketing"],
    permissions: ["leads:create", "leads:read"],
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  },
  COMMUNICATION: {
    id: "COMMUNICATION",
    name: "Communication Specialist",
    badgeLabel: "Communication",
    description: "Initiates contact, schedules meetings, and moves leads to Vigilance.",
    allowedDepartments: ["communication"],
    permissions: ["leads:read", "leads:edit_communication"],
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
  },
  VIGILANCE: {
    id: "VIGILANCE",
    name: "Vigilance Officer",
    badgeLabel: "Vigilance",
    description: "Verifies lead details and uploads mandatory verification audio call records.",
    allowedDepartments: ["vigilance"],
    permissions: ["leads:read", "leads:edit_vigilance", "leads:upload_audio"],
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",
  },
  SUPPORT: {
    id: "SUPPORT",
    name: "Support Coordinator",
    badgeLabel: "Support",
    description: "Performs final checks (Date, Time, Address) and allocates to Sales.",
    allowedDepartments: ["support"],
    permissions: ["leads:read", "leads:allocate_support"],
    color: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800",
  },
  SALES: {
    id: "SALES",
    name: "Sales Executive",
    badgeLabel: "Sales",
    description: "Listens to complete verification audio recording and claims leads.",
    allowedDepartments: ["sales", "claimed"],
    permissions: ["leads:read", "leads:claim_sales"],
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  },
};

export const MOCK_USERS: Record<Role, { id: string; name: string; email: string; role: Role; department: string; avatar: string }> = {
  ADMIN: {
    id: "usr-admin-01",
    name: "Ananya Sharma",
    email: "admin@vibhanu.com",
    role: "ADMIN",
    department: "Executive Management",
    avatar: "AS",
  },
  MARKETING: {
    id: "usr-mkt-01",
    name: "Rohan Varma",
    email: "marketing@vibhanu.com",
    role: "MARKETING",
    department: "Growth & Acquisition",
    avatar: "RV",
  },
  COMMUNICATION: {
    id: "usr-com-01",
    name: "Pooja Hegde",
    email: "communication@vibhanu.com",
    role: "COMMUNICATION",
    department: "Customer Outreach",
    avatar: "PH",
  },
  VIGILANCE: {
    id: "usr-vig-01",
    name: "Vikram Malhotra",
    email: "vigilance@vibhanu.com",
    role: "VIGILANCE",
    department: "Compliance & Vigilance",
    avatar: "VM",
  },
  SUPPORT: {
    id: "usr-sup-01",
    name: "Neha Sundaram",
    email: "support@vibhanu.com",
    role: "SUPPORT",
    department: "Operations & Support",
    avatar: "NS",
  },
  SALES: {
    id: "usr-sal-01",
    name: "Aditya Deshmukh",
    email: "sales@vibhanu.com",
    role: "SALES",
    department: "Enterprise Sales",
    avatar: "AD",
  },
};
