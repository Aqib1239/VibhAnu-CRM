import { z } from "zod";
import { DEPARTMENTS, LEAD_STATUS } from "../constants/departments";

export const leadQueryValidator = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10)) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10))) : 20)),
  search: z.string().optional(),
  department: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "name", "currentDepartment", "status"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  from: z.string().optional(),
  to: z.string().optional(),
});
