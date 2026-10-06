import { z } from "zod";

// Phone number regex: accepts standard Indian 10-digit mobile numbers or with +91 / 0 prefix
const indianPhoneRegex = /^(?:(?:\+|0{0,2})91(\s*[-]\s*)?|[0]?)?[6789]\d{9}$/;

export const createLeadMarketingSchema = z.object({
  name: z
    .string()
    .min(2, "Lead name must be at least 2 characters")
    .max(80, "Lead name cannot exceed 80 characters"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits")
    .regex(indianPhoneRegex, "Enter a valid 10-digit Indian mobile number (e.g. 9876543210)"),
  city: z.string().optional(),
  state: z.string().optional(),
  initialRemarks: z.string().optional(),
});

export type CreateLeadMarketingFormData = z.infer<typeof createLeadMarketingSchema>;

export const communicationLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z.string(), // Read-only in UI, but passed along
  postalAddress: z
    .string()
    .min(5, "Postal address is required to proceed with communication"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter a valid 6-digit Pincode").optional().or(z.literal("")),
  date: z.string().min(1, "Meeting date is required"),
  time: z.string().min(1, "Meeting time is required"),
  remark: z.string().min(3, "Meeting discussion summary/remark is required"),
});

export type CommunicationLeadFormData = z.infer<typeof communicationLeadSchema>;

export const vigilanceLeadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  contactNumber: z.string(), // Read-only
  postalAddress: z.string().min(5, "Postal address must be complete and verified"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().optional(),
  date: z.string().min(1, "Verification date is required"),
  time: z.string().min(1, "Verification time is required"),
  remark: z.string().min(3, "Vigilance audit remarks are required"),
  hasAudio: z.boolean().refine((val) => val === true, {
    message: "Mandatory: An audio recording of the verification call must be uploaded before proceeding.",
  }),
});

export type VigilanceLeadFormData = z.infer<typeof vigilanceLeadSchema>;

export const supportVerificationSchema = z.object({
  isDateVerified: z.boolean().refine((val) => val === true, {
    message: "Date verification confirmation is required",
  }),
  isTimeVerified: z.boolean().refine((val) => val === true, {
    message: "Time slot verification confirmation is required",
  }),
  isAddressVerified: z.boolean().refine((val) => val === true, {
    message: "Complete address verification confirmation is required",
  }),
  allocatedTo: z.string().min(1, "Select a Sales Executive to allocate this lead to"),
  allocationNotes: z.string().optional(),
});

export type SupportVerificationFormData = z.infer<typeof supportVerificationSchema>;

export const salesClaimSchema = z.object({
  audioListenCompleted: z.boolean().refine((val) => val === true, {
    message: "You must listen to the complete audio recording before claiming this lead.",
  }),
  dealValue: z.number().positive("Deal value must be greater than 0").optional(),
  closingRemarks: z.string().optional(),
});

export type SalesClaimFormData = z.infer<typeof salesClaimSchema>;
