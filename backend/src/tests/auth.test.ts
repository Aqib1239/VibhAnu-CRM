import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "../app";
import { User } from "../models/User.model";
import { ROLES } from "../constants/roles";

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
});

describe("Authentication API", () => {
  const testUser = {
    name: "Test Admin",
    email: "admin@vibhanu.com",
    password: "Password@123",
    role: ROLES.ADMIN,
    department: "Executive Management",
  };

  it("should securely hash password on save and not expose plaintext", async () => {
    const user = new User(testUser);
    await user.save();

    const rawUser = await User.findById(user._id).select("+password");
    expect(rawUser?.password).toBeDefined();
    expect(rawUser?.password).not.toBe(testUser.password);
    expect(rawUser?.password).toMatch(/^\$2[aby]\$/); // bcrypt hash format
  });

  it("should successfully log in with valid credentials and return JWT & user", async () => {
    const user = new User(testUser);
    await user.save();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user.role).toBe(ROLES.ADMIN);
    expect(res.body.data.user.password).toBeUndefined();
  });

  it("should reject login with wrong password (401)", async () => {
    const user = new User(testUser);
    await user.save();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: "WrongPassword" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should reject login for non-existent email (401)", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "unknown@vibhanu.com", password: "Password@123" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("should fetch current authenticated user via GET /api/auth/me", async () => {
    const user = new User(testUser);
    await user.save();

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testUser.email, password: testUser.password });

    const token = loginRes.body.data.token;

    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.data.user.email).toBe(testUser.email);
    expect(meRes.body.data.user.name).toBe(testUser.name);
  });

  it("should reject unauthenticated requests to /api/auth/me (401)", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
