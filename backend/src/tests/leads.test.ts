import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app";
import { User } from "../models/User.model";
import { Lead } from "../models/Lead.model";
import { ROLES } from "../constants/roles";
import { DEPARTMENTS, LEAD_STATUS } from "../constants/departments";
import { generateToken } from "../utils/jwt";

let mongoServer: MongoMemoryServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Lead.deleteMany({});
});

describe("Complete Lead Lifecycle & Workflow Engine Tests", () => {
  async function createRoleToken(role: any, email: string, name: string) {
    const user = new User({
      name,
      email,
      password: "Password@123",
      role,
      department: `${role} Department`,
    });
    await user.save();
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
    });
    return { user, token };
  }

  it("should process a lead through the full 5-stage lifecycle from Marketing to Claimed", async () => {
    // Setup users
    const mkt = await createRoleToken(ROLES.MARKETING, "mkt@vibhanu.com", "Rohan Varma");
    const com = await createRoleToken(ROLES.COMMUNICATION, "com@vibhanu.com", "Pooja Hegde");
    const vig = await createRoleToken(ROLES.VIGILANCE, "vig@vibhanu.com", "Vikram Malhotra");
    const sup = await createRoleToken(ROLES.SUPPORT, "sup@vibhanu.com", "Neha Sundaram");
    const sal = await createRoleToken(ROLES.SALES, "sal@vibhanu.com", "Aditya Deshmukh");

    // Stage 1: Marketing creates lead
    const createRes = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${mkt.token}`)
      .send({
        name: "Enterprise Buyer Inc",
        contactNumber: "9876543210",
        city: "Mumbai",
        state: "Maharashtra",
        initialRemarks: "Inbound web form inquiry",
      });

    expect(createRes.status).toBe(201);
    const leadId = createRes.body.data.lead.id || createRes.body.data.lead._id;
    expect(createRes.body.data.lead.currentDepartment).toBe(DEPARTMENTS.COMMUNICATION);
    expect(createRes.body.data.lead.status).toBe(LEAD_STATUS.IN_PROGRESS);

    // Stage 2: Communication schedules meeting
    const meetRes = await request(app)
      .post(`/api/leads/${leadId}/meeting`)
      .set("Authorization", `Bearer ${com.token}`)
      .send({
        name: "Enterprise Buyer Inc",
        contactNumber: "9876543210",
        postalAddress: "101 Cyber City, Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400051",
        date: "2026-10-05",
        time: "11:00 AM",
        remark: "Discussed multi-license deployment with IT head.",
      });

    expect(meetRes.status).toBe(200);
    expect(meetRes.body.data.lead.currentDepartment).toBe(DEPARTMENTS.VIGILANCE);
    expect(meetRes.body.data.lead.status).toBe(LEAD_STATUS.MEETING_SCHEDULED);

    // Stage 3a: Vigilance verify without audio MUST fail (422)
    const failVigRes = await request(app)
      .post(`/api/leads/${leadId}/verify`)
      .set("Authorization", `Bearer ${vig.token}`)
      .send({
        name: "Enterprise Buyer Inc",
        postalAddress: "101 Cyber City, Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        date: "2026-10-05",
        time: "11:00 AM",
        remark: "Verification audit complete",
      });

    expect(failVigRes.status).toBe(422);

    // Stage 3b: Attach audio and verify
    // Attach audio metadata directly or upload
    await Lead.findByIdAndUpdate(leadId, {
      "vigilanceDetails.audio": {
        id: "aud_test_1",
        fileName: "call_verification.wav",
        originalName: "call_verification.wav",
        fileSize: 1000000,
        duration: 180,
        url: `/api/leads/${leadId}/audio`,
        storagePath: "demo.wav",
        mimeType: "audio/wav",
        uploadedBy: "Vikram Malhotra",
        uploadedAt: new Date().toISOString(),
      },
    });

    const passVigRes = await request(app)
      .post(`/api/leads/${leadId}/verify`)
      .set("Authorization", `Bearer ${vig.token}`)
      .send({
        name: "Enterprise Buyer Inc",
        postalAddress: "101 Cyber City, Bandra Kurla Complex",
        city: "Mumbai",
        state: "Maharashtra",
        date: "2026-10-05",
        time: "11:00 AM",
        remark: "Vigilance audit passed with verified audio recording.",
      });

    expect(passVigRes.status).toBe(200);
    expect(passVigRes.body.data.lead.currentDepartment).toBe(DEPARTMENTS.SUPPORT);
    expect(passVigRes.body.data.lead.status).toBe(LEAD_STATUS.VERIFIED);

    // Stage 4a: Support allocate without 3-point check MUST fail (422)
    const failSupRes = await request(app)
      .post(`/api/leads/${leadId}/allocate`)
      .set("Authorization", `Bearer ${sup.token}`)
      .send({
        isDateVerified: true,
        isTimeVerified: false, // Incomplete!
        isAddressVerified: true,
        allocatedTo: "Aditya Deshmukh",
      });

    expect(failSupRes.status).toBe(422);

    // Stage 4b: Support allocate with 3-point checklist
    const passSupRes = await request(app)
      .post(`/api/leads/${leadId}/allocate`)
      .set("Authorization", `Bearer ${sup.token}`)
      .send({
        isDateVerified: true,
        isTimeVerified: true,
        isAddressVerified: true,
        allocatedTo: "Aditya Deshmukh",
        allocationNotes: "High value target",
      });

    expect(passSupRes.status).toBe(200);
    expect(passSupRes.body.data.lead.currentDepartment).toBe(DEPARTMENTS.SALES);
    expect(passSupRes.body.data.lead.status).toBe(LEAD_STATUS.ALLOCATED);

    // Stage 5: Sales claims lead
    const claimRes = await request(app)
      .post(`/api/leads/${leadId}/claim`)
      .set("Authorization", `Bearer ${sal.token}`)
      .send({
        dealValue: 500000,
        closingRemarks: "Deal closed on standard enterprise terms.",
      });

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.data.lead.currentDepartment).toBe(DEPARTMENTS.CLAIMED);
    expect(claimRes.body.data.lead.status).toBe(LEAD_STATUS.CLAIMED);
    expect(claimRes.body.data.lead.salesDetails.dealValue).toBe(500000);

    // Double claim MUST fail with 409 Conflict
    const doubleClaimRes = await request(app)
      .post(`/api/leads/${leadId}/claim`)
      .set("Authorization", `Bearer ${sal.token}`)
      .send({
        dealValue: 500000,
      });

    expect(doubleClaimRes.status).toBe(409);
  });
});
