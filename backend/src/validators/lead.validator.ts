import { z } from "zod";

const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;

export const createLeadValidator = z.object({
  name: z.string().min(2, "Lead name must be at least 2 characters").max(80, "Name cannot exceed 80 characters"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .regex(indianPhoneRegex, "Enter a valid Indian mobile number (e.g. 9876543210)"),
  city: z.string().optional().default("Mumbai"),
  state: z.string().optional().default("Maharashtra"),
  initialRemarks: z.string().optional(),
});

export const scheduleMeetingValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  postalAddress: z.string().min(5, "Postal address is required to proceed with communication"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit Pincode").optional().or(z.literal("")),
  date: z.string().min(1, "Meeting date is required"),
  time: z.string().min(1, "Meeting time is required"),
  remark: z.string().min(3, "Meeting discussion summary/remark is required"),
});

export const verifyVigilanceValidator = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  postalAddress: z.string().min(5, "Postal address must be complete and verified"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().optional(),
  date: z.string().min(1, "Verification date is required"),
  time: z.string().min(1, "Verification time is required"),
  remark: z.string().min(3, "Vigilance audit remarks are required"),
  // Note: audio is uploaded via POST /api/leads/:id/audio or verified existing in document
});

export const allocateSupportValidator = z.object({
  isDateVerified: z.boolean().refine((v) => v === true, {
    message: "Date verification confirmation is required",
  }),
  isTimeVerified: z.boolean().refine((v) => v === true, {
    message: "Time slot verification confirmation is required",
  }),
  isAddressVerified: z.boolean().refine((v) => v === true, {
    message: "Complete address verification confirmation is required",
  }),
  allocatedTo: z.string().min(1, "Select a Sales Executive to allocate this lead to"),
  allocationNotes: z.string().optional(),
});

export const claimSalesValidator = z.object({
  dealValue: z.number().positive("Deal value must be greater than 0").optional(),
  closingRemarks: z.string().optional(),
});
