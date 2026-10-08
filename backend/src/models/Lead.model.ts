import mongoose, { Document, Schema, Model } from "mongoose";
import { DEPARTMENTS, LEAD_STATUS, DepartmentType, LeadStatusType } from "../constants/departments";
import { IAudioMetadata, ILeadDocument, IVerificationMetadata, IWorkflowHistoryItem } from "../types/lead.types";

export interface ILead extends Document, Omit<ILeadDocument, "id"> {
  _id: mongoose.Types.ObjectId;
}

const AudioSchema = new Schema<IAudioMetadata>(
  {
    id: { type: String, required: true },
    fileName: { type: String, required: true },
    originalName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    duration: { type: Number, required: true, default: 180 },
    url: { type: String, required: true },
    storagePath: { type: String, required: true },
    mimeType: { type: String, required: true, default: "audio/mpeg" },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: String, required: true },
    waveformSample: { type: [Number], default: [] },
    publicId: { type: String },
    resourceType: { type: String, default: "video" },
  },
  { _id: false }
);

const VerificationSchema = new Schema<IVerificationMetadata>(
  {
    isDateVerified: { type: Boolean, default: false },
    isTimeVerified: { type: Boolean, default: false },
    isAddressVerified: { type: Boolean, default: false },
    verifiedBy: { type: String },
    verifiedAt: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const WorkflowHistorySchema = new Schema<IWorkflowHistoryItem>(
  {
    id: { type: String, required: true },
    department: {
      type: String,
      enum: Object.values(DEPARTMENTS),
      required: true,
    },
    action: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    timestamp: { type: String, required: true },
    description: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const leadSchema = new Schema<ILead>(
  {
    leadCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
      index: true,
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      trim: true,
      index: true,
    },
    postalAddress: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: "Mumbai",
    },
    state: {
      type: String,
      trim: true,
      default: "Maharashtra",
    },
    pincode: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      trim: true,
    },
    time: {
      type: String,
      trim: true,
    },
    remark: {
      type: String,
      trim: true,
    },
    currentDepartment: {
      type: String,
      enum: Object.values(DEPARTMENTS),
      default: DEPARTMENTS.COMMUNICATION,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.IN_PROGRESS,
      required: true,
      index: true,
    },
    createdBy: {
      type: String,
      required: true,
    },
    createdById: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Department Details
    communicationDetails: {
      scheduledDate: { type: String },
      scheduledTime: { type: String },
      meetingNotes: { type: String },
      completedAt: { type: String },
      completedBy: { type: String },
    },

    vigilanceDetails: {
      audio: { type: AudioSchema },
      verificationNotes: { type: String },
      completedAt: { type: String },
      completedBy: { type: String },
    },

    supportDetails: {
      verification: {
        type: VerificationSchema,
        default: () => ({
          isDateVerified: false,
          isTimeVerified: false,
          isAddressVerified: false,
        }),
      },
      allocatedTo: { type: String },
      allocationNotes: { type: String },
      completedAt: { type: String },
      completedBy: { type: String },
    },

    salesDetails: {
      audioListenCompleted: { type: Boolean, default: false },
      claimedBy: { type: String },
      claimedById: { type: Schema.Types.ObjectId, ref: "User" },
      claimedAt: { type: String },
      dealValue: { type: Number },
      closingRemarks: { type: String },
    },

    workflowHistory: {
      type: [WorkflowHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: any) {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for optimal querying
leadSchema.index({ currentDepartment: 1, createdAt: -1 });
leadSchema.index({ currentDepartment: 1, status: 1, createdAt: -1 });
leadSchema.index({ status: 1, createdAt: -1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ updatedAt: -1 });
leadSchema.index({ "supportDetails.allocatedTo": 1, currentDepartment: 1 });
leadSchema.index({ "salesDetails.claimedById": 1 });
leadSchema.index({ name: "text", leadCode: "text", contactNumber: "text", remark: "text" });

export const Lead: Model<ILead> = mongoose.models.Lead || mongoose.model<ILead>("Lead", leadSchema);
