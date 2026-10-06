import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app";
import { User } from "../models/User.model";
import { ROLES } from "../constants/roles";
import { generateToken } from "../utils/jwt";

let mongoServer: MongoMemoryServer;

jest.setTimeout(120000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("RBAC Authorization Tests", () => {
  async function createRoleUser(role: any, email: string) {
    const user = new User({
      name: `${role} User`,
      email,
      password: "Password@123",
      role,
      department: "Test Dept",
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

  it("should allow MARKETING user to create a lead (201)", async () => {
    const { token } = await createRoleUser(ROLES.MARKETING, "mkt@vibhanu.com");

    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Test Lead",
        contactNumber: "9876543210",
        city: "Mumbai",
        state: "Maharashtra",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lead.name).toBe("Test Lead");
  });

  it("should FORBID SALES user from creating a lead (403)", async () => {
    const { token } = await createRoleUser(ROLES.SALES, "sal@vibhanu.com");

    const res = await request(app)
      .post("/api/leads")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Forbidden Lead",
        contactNumber: "9876543210",
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("should allow ADMIN user to access admin endpoints (200)", async () => {
    const { token } = await createRoleUser(ROLES.ADMIN, "admin@vibhanu.com");

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.users).toBeDefined();
  });

  it("should FORBID MARKETING user from accessing admin endpoints (403)", async () => {
    const { token } = await createRoleUser(ROLES.MARKETING, "mkt2@vibhanu.com");

    const res = await request(app)
      .get("/api/admin/users")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});
