import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Lead } from "../models/Lead.model";
import { DEPARTMENTS, LEAD_STATUS, WORKFLOW_ACTIONS } from "../constants/departments";
import { ROLES } from "../constants/roles";
import { logger } from "../config/logger";

const NEW_VIGILANCE_LEADS = [
  {
    leadCode: "VA-2026-1021",
    name: "Tata Precision Engineering Ltd",
    contactNumber: "+91 98201 44520",
    city: "Navi Mumbai",
    state: "Maharashtra",
    pincode: "400705",
    postalAddress: "Plot C-45, TTC Industrial Area, MIDC Pawane",
    date: "2026-10-07",
    time: "11:00 AM",
    currentDepartment: DEPARTMENTS.VIGILANCE,
    status: LEAD_STATUS.MEETING_SCHEDULED,
    createdBy: "Rohan Varma (MARKETING)",
    remark: "Enterprise industrial tools procurement inquiry. Transferred to Vigilance for physical address & authorized signatory call verification.",
    communicationDetails: {
      scheduledDate: "2026-10-07",
      scheduledTime: "11:00 AM",
      meetingNotes: "Discussion completed with VP of Procurement. Handed over to Vigilance for compliance telephonic audit.",
      completedAt: "2026-10-07T11:45:00.000Z",
      completedBy: "Pooja Hegde (COMMUNICATION)",
    },
    vigilanceDetails: {
      verificationNotes: "Physical office in MIDC Pawane confirmed. Awaiting mandatory call recording upload.",
    },
    workflowHistory: [
      {
        id: "wf_1021_created",
        department: DEPARTMENTS.MARKETING,
        action: WORKFLOW_ACTIONS.LEAD_CREATED,
        userName: "Rohan Varma",
        userRole: ROLES.MARKETING,
        timestamp: "2026-10-06T09:30:00.000Z",
        description: "Direct industrial inquiry captured from Indian Manufacturing Expo 2026.",
      },
      {
        id: "wf_1021_meeting",
        department: DEPARTMENTS.COMMUNICATION,
        action: WORKFLOW_ACTIONS.MEETING_SCHEDULED,
        userName: "Pooja Hegde",
        userRole: ROLES.COMMUNICATION,
        timestamp: "2026-10-07T11:45:00.000Z",
        description: "Discovery call concluded. Forwarded to Vigilance queue for call recording verification.",
      },
    ],
  },
  {
    leadCode: "VA-2026-1022",
    name: "Aurobindo Logistics & ColdChain",
    contactNumber: "+91 98490 88214",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500409",
    postalAddress: "Survey No. 78, Hyderabad Airport Cargo Complex, Shamshabad",
    date: "2026-10-07",
    time: "02:30 PM",
    currentDepartment: DEPARTMENTS.VIGILANCE,
    status: LEAD_STATUS.MEETING_SCHEDULED,
    createdBy: "Rohan Varma (MARKETING)",
    remark: "Cold-chain pharmaceutical telemetry contract. Pending phone audit & compliance voice recording upload.",
    communicationDetails: {
      scheduledDate: "2026-10-07",
      scheduledTime: "02:30 PM",
      meetingNotes: "Outreach meeting held with Director of Logistics. Ready for statutory vigilance check.",
      completedAt: "2026-10-07T15:15:00.000Z",
      completedBy: "Pooja Hegde (COMMUNICATION)",
    },
    vigilanceDetails: {
      verificationNotes: "Airport cargo warehouse premises confirmed. Telephonic audit call scheduled.",
    },
    workflowHistory: [
      {
        id: "wf_1022_created",
        department: DEPARTMENTS.MARKETING,
        action: WORKFLOW_ACTIONS.LEAD_CREATED,
        userName: "Rohan Varma",
        userRole: ROLES.MARKETING,
        timestamp: "2026-10-06T11:00:00.000Z",
        description: "Inbound enterprise web form inquiry recorded.",
      },
      {
        id: "wf_1022_meeting",
        department: DEPARTMENTS.COMMUNICATION,
        action: WORKFLOW_ACTIONS.MEETING_SCHEDULED,
        userName: "Pooja Hegde",
        userRole: ROLES.COMMUNICATION,
        timestamp: "2026-10-07T15:15:00.000Z",
        description: "Meeting held. Transferred to Vigilance for identity & audio verification.",
      },
    ],
  },
  {
    leadCode: "VA-2026-1023",
    name: "Infosys BPO Infrastructure Ltd",
    contactNumber: "+91 98860 32190",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560100",
    postalAddress: "Plot 44, Electronic City Phase 1, Hosur Road",
    date: "2026-10-08",
    time: "10:00 AM",
    currentDepartment: DEPARTMENTS.VIGILANCE,
    status: LEAD_STATUS.IN_PROGRESS,
    createdBy: "Rohan Varma (MARKETING)",
    remark: "Multi-branch customer support center deployment. GSTIN & registered office verification initiated.",
    communicationDetails: {
      scheduledDate: "2026-10-08",
      scheduledTime: "10:00 AM",
      meetingNotes: "Meeting concluded with IT Infra team. Handed over to Vigilance.",
      completedAt: "2026-10-08T10:45:00.000Z",
      completedBy: "Pooja Hegde (COMMUNICATION)",
    },
    vigilanceDetails: {
      verificationNotes: "ROC filings verified online. Verification call initiated with site director.",
    },
    workflowHistory: [
      {
        id: "wf_1023_created",
        department: DEPARTMENTS.MARKETING,
        action: WORKFLOW_ACTIONS.LEAD_CREATED,
        userName: "Rohan Varma",
        userRole: ROLES.MARKETING,
        timestamp: "2026-10-07T10:00:00.000Z",
        description: "Corporate account request generated.",
      },
      {
        id: "wf_1023_meeting",
        department: DEPARTMENTS.COMMUNICATION,
        action: WORKFLOW_ACTIONS.MEETING_SCHEDULED,
        userName: "Pooja Hegde",
        userRole: ROLES.COMMUNICATION,
        timestamp: "2026-10-08T10:45:00.000Z",
        description: "Virtual sync completed. Sent to Vigilance department.",
      },
    ],
  },
  {
    leadCode: "VA-2026-1024",
    name: "Godrej Agrovet Consumer Solutions",
    contactNumber: "+91 97110 59483",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400079",
    postalAddress: "Pirojshanagar, Eastern Express Highway, Vikhroli East",
    date: "2026-10-08",
    time: "12:30 PM",
    currentDepartment: DEPARTMENTS.VIGILANCE,
    status: LEAD_STATUS.MEETING_SCHEDULED,
    createdBy: "Rohan Varma (MARKETING)",
    remark: "Agricultural distribution CRM contract. Awaiting mandatory customer verification call audio recording.",
    communicationDetails: {
      scheduledDate: "2026-10-08",
      scheduledTime: "12:30 PM",
      meetingNotes: "Scope finalized with regional procurement lead. Moved to Vigilance queue.",
      completedAt: "2026-10-08T13:15:00.000Z",
      completedBy: "Pooja Hegde (COMMUNICATION)",
    },
    vigilanceDetails: {
      verificationNotes: "Corporate office Vikhroli verified. Ready for verification call recording.",
    },
    workflowHistory: [
      {
        id: "wf_1024_created",
        department: DEPARTMENTS.MARKETING,
        action: WORKFLOW_ACTIONS.LEAD_CREATED,
        userName: "Rohan Varma",
        userRole: ROLES.MARKETING,
        timestamp: "2026-10-07T14:30:00.000Z",
        description: "Lead created via strategic partner referral.",
      },
      {
        id: "wf_1024_meeting",
        department: DEPARTMENTS.COMMUNICATION,
        action: WORKFLOW_ACTIONS.MEETING_SCHEDULED,
        userName: "Pooja Hegde",
        userRole: ROLES.COMMUNICATION,
        timestamp: "2026-10-08T13:15:00.000Z",
        description: "Meeting held. Transferred to Vigilance for identity & audio verification.",
      },
    ],
  },
  {
    leadCode: "VA-2026-1025",
    name: "Sun Pharma Healthcare Devices",
    contactNumber: "+91 99099 23819",
    city: "Vadodara",
    state: "Gujarat",
    pincode: "390012",
    postalAddress: "Sun Pharma Advanced Research Centre, Tandalja",
    date: "2026-10-08",
    time: "03:00 PM",
    currentDepartment: DEPARTMENTS.VIGILANCE,
    status: LEAD_STATUS.MEETING_SCHEDULED,
    createdBy: "Rohan Varma (MARKETING)",
    remark: "Medical hardware compliance review. Verification call pending audio recording upload.",
    communicationDetails: {
      scheduledDate: "2026-10-08",
      scheduledTime: "03:00 PM",
      meetingNotes: "Commercial meeting concluded. Client awaiting telephonic verification call.",
      completedAt: "2026-10-08T15:40:00.000Z",
      completedBy: "Pooja Hegde (COMMUNICATION)",
    },
    vigilanceDetails: {
      verificationNotes: "R&D centre registered address confirmed. Telephonic audit awaiting call audio.",
    },
    workflowHistory: [
      {
        id: "wf_1025_created",
        department: DEPARTMENTS.MARKETING,
        action: WORKFLOW_ACTIONS.LEAD_CREATED,
        userName: "Rohan Varma",
        userRole: ROLES.MARKETING,
        timestamp: "2026-10-07T16:00:00.000Z",
        description: "Inbound portal lead registered.",
      },
      {
        id: "wf_1025_meeting",
        department: DEPARTMENTS.COMMUNICATION,
        action: WORKFLOW_ACTIONS.MEETING_SCHEDULED,
        userName: "Pooja Hegde",
        userRole: ROLES.COMMUNICATION,
        timestamp: "2026-10-08T15:40:00.000Z",
        description: "Meeting wrapped up. Handed over to Vigilance for compliance audit.",
      },
    ],
  },
];

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing from environment");
  }

  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(mongoUri);
  console.log("Connected successfully.\n");

  // ==============================================================
  // 1. Identify & Remove Obsolete Support Upload Data
  // ==============================================================
  const allSupportLeads = await Lead.find({ currentDepartment: DEPARTMENTS.SUPPORT });
  console.log(`Found ${allSupportLeads.length} total Support leads currently in database.`);

  const obsoleteSupportLeads = allSupportLeads.filter((lead) => {
    const audio = lead.vigilanceDetails?.audio;
    if (!audio) return false;
    // Check if audio uses Cloudinary
    const isCloudinaryUrl = audio.url && audio.url.startsWith("https://res.cloudinary.com/");
    const isCloudinaryPublicId =
      audio.storagePath &&
      audio.storagePath.includes("vibhanu-crm/audio/") &&
      !audio.storagePath.endsWith(".wav") &&
      !audio.storagePath.endsWith(".mp3");

    // If it does NOT use Cloudinary, it is an obsolete local/test upload record
    return !isCloudinaryUrl && !isCloudinaryPublicId;
  });

  console.log(`Identified ${obsoleteSupportLeads.length} obsolete Support leads with legacy local audio.`);
  const removedSupportSummary: Array<{ id: string; leadCode: string; name: string; audioFile?: string }> = [];

  for (const lead of obsoleteSupportLeads) {
    removedSupportSummary.push({
      id: lead._id.toString(),
      leadCode: lead.leadCode,
      name: lead.name,
      audioFile: lead.vigilanceDetails?.audio?.fileName || lead.vigilanceDetails?.audio?.storagePath,
    });
    await Lead.deleteOne({ _id: lead._id });
    console.log(`  -> Removed obsolete Support lead: [${lead.leadCode}] ${lead.name}`);
  }

  // ==============================================================
  // 2. Add Exactly 5 Vigilance Datasets
  // ==============================================================
  console.log(`\nAdding 5 fresh Vigilance datasets (without audio, ready for Cloudinary upload)...`);
  const createdVigilanceSummary: Array<{ id: string; leadCode: string; name: string; dept: string; hasAudio: boolean }> = [];

  for (const leadData of NEW_VIGILANCE_LEADS) {
    // Idempotent: upsert by leadCode
    const existing = await Lead.findOne({ leadCode: leadData.leadCode });
    if (existing) {
      existing.set(leadData);
      existing.set("vigilanceDetails.audio", undefined);
      await existing.save();
      createdVigilanceSummary.push({
        id: existing._id.toString(),
        leadCode: existing.leadCode,
        name: existing.name,
        dept: existing.currentDepartment,
        hasAudio: !!existing.vigilanceDetails?.audio,
      });
      console.log(`  -> Updated existing Vigilance lead: [${existing.leadCode}] ${existing.name}`);
    } else {
      const newLead = new Lead(leadData);
      await newLead.save();
      createdVigilanceSummary.push({
        id: newLead._id.toString(),
        leadCode: newLead.leadCode,
        name: newLead.name,
        dept: newLead.currentDepartment,
        hasAudio: !!newLead.vigilanceDetails?.audio,
      });
      console.log(`  -> Created fresh Vigilance lead: [${newLead.leadCode}] ${newLead.name}`);
    }
  }

  // ==============================================================
  // 3. Verification of Final Database State
  // ==============================================================
  console.log("\n==================== VERIFICATION ====================");
  const remainingSupport = await Lead.find({ currentDepartment: DEPARTMENTS.SUPPORT });
  console.log(`Remaining Support leads in DB: ${remainingSupport.length}`);

  const vigilanceLeads = await Lead.find({ currentDepartment: DEPARTMENTS.VIGILANCE });
  console.log(`Total Vigilance leads in DB: ${vigilanceLeads.length}`);
  vigilanceLeads.forEach((l) => {
    console.log(
      `  - [${l.leadCode}] ${l.name} | Dept: ${l.currentDepartment} | Status: ${l.status} | Audio: ${
        l.vigilanceDetails?.audio ? "PRESENT" : "ABSENT (Ready for upload)"
      }`
    );
  });

  const totalLeads = await Lead.countDocuments();
  console.log(`Total Leads across all departments in DB: ${totalLeads}`);

  await mongoose.disconnect();
  console.log("\nDatabase disconnected cleanly.");

  return {
    removedSupportCount: removedSupportSummary.length,
    removedSupportSummary,
    createdVigilanceCount: createdVigilanceSummary.length,
    createdVigilanceSummary,
  };
}

main()
  .then((res) => {
    console.log("\nMigration completed successfully.");
  })
  .catch((err) => {
    console.error("Migration error:", err);
    process.exit(1);
  });
