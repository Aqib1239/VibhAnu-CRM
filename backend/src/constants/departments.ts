export const DEPARTMENTS = {
  MARKETING: "marketing",
  COMMUNICATION: "communication",
  VIGILANCE: "vigilance",
  SUPPORT: "support",
  SALES: "sales",
  CLAIMED: "claimed",
} as const;

export type DepartmentType = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];

export const LEAD_STATUS = {
  NEW: "new",
  IN_PROGRESS: "in_progress",
  MEETING_SCHEDULED: "meeting_scheduled",
  VERIFIED: "verified",
  ALLOCATED: "allocated",
  CLAIMED: "claimed",
  REJECTED: "rejected",
} as const;

export type LeadStatusType = (typeof LEAD_STATUS)[keyof typeof LEAD_STATUS];

export const WORKFLOW_ACTIONS = {
  LEAD_CREATED: "Lead Created",
  MEETING_SCHEDULED: "Meeting Scheduled",
  VERIFIED_AND_AUDIO_UPLOADED: "Verified & Audio Uploaded",
  ALLOCATED_TO_SALES: "Allocated to Sales",
  AUDIO_LISTENED_AND_CLAIMED: "Audio Listened & Lead Claimed",
  STATUS_UPDATED: "Status Updated",
} as const;
