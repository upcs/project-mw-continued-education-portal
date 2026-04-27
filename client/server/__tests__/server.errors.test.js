process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const adminToken = jwt.sign(
  { id: 1, email: "admin@example.com", role: "admin" },
  process.env.JWT_SECRET
);

const educatorToken = jwt.sign(
  { id: 2, email: "educator@example.com", role: "educator" },
  process.env.JWT_SECRET
);

const trainerToken = jwt.sign(
  { id: 3, email: "trainer@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function mockDbResponses(...responses) {
  let index = 0;

  dbms.dbquery.mockImplementation((query, params, callback) => {
    const cb = typeof params === "function" ? params : callback;
    const response = responses[index++] ?? [];

    if (response instanceof Error) {
      return cb(response);
    }

    return cb(null, response);
  });
}

describe("Backend API error-path tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("protected route returns 401 without token", async () => {
    const res = await request(app).get("/api/profile/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("protected route returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", "Bearer bad-token");

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("trainer-only route returns 403 for educator", async () => {
    const res = await request(app)
      .get("/api/dashboard/trainer-stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/courses/:id returns 400 for invalid id", async () => {
    const res = await request(app).get("/api/courses/abc");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/courses/:id returns 404 when course not found", async () => {
    mockDbResponses([]);

    const res = await request(app).get("/api/courses/999");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/courses returns 500 on db error", async () => {
    mockDbResponses(new Error("db failed"));

    const res = await request(app).get("/api/courses");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/profile/me returns 404 when profile not found", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .get("/api/profile/me")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/profile/me returns 500 on db error", async () => {
    mockDbResponses(new Error("profile db error"));

    const res = await request(app)
      .get("/api/profile/me")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/signup returns 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email: "bad@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/signup returns 400 for invalid role", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "Bad Role",
        email: "bad@example.com",
        password: "password123",
        role: "student",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/signup returns 409 when user exists", async () => {
    mockDbResponses([{ email: "exists@example.com" }]);

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "Existing User",
        email: "exists@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login returns 404 when user not found", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "missing@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/auth/login returns 401 for wrong password", async () => {
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("correct-password", 10);

    mockDbResponses([
      {
        email: "john@example.com",
        password: hashedPassword,
        approval_status: "approved",
      },
    ]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "wrong-password",
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/profile/update returns 500 on db error", async () => {
    mockDbResponses(new Error("update failed"));

    const res = await request(app)
      .post("/api/profile/update")
      .set(auth(educatorToken))
      .send({
        fullname: "Educator",
        photo: "",
        whatsapp: "",
        specialization: "",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/profile/upload-photo returns 400 without file", async () => {
    const res = await request(app)
      .post("/api/profile/upload-photo")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:courseId/enroll returns 404 when profile missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:courseId/enroll returns 400 when no organization", async () => {
    mockDbResponses([{ organization_id: null }]);

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:courseId/enroll returns 404 when course missing", async () => {
    mockDbResponses([{ organization_id: 1 }], []);

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:courseId/check-completion returns 500 on first db error", async () => {
    mockDbResponses(new Error("total quiz error"));

    const res = await request(app)
      .post("/api/courses/1/check-completion")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/submissions/:submissionId/grade returns 400 for invalid id", async () => {
    const res = await request(app)
      .put("/api/submissions/abc/grade")
      .set(auth(adminToken))
      .send({ status: "approved" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/submissions/:submissionId/grade returns 400 for invalid status", async () => {
    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(adminToken))
      .send({ status: "bad-status" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("PUT /api/submissions/:submissionId/grade returns 404 when submission missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(adminToken))
      .send({ status: "approved" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/dashboard/educator-stats returns 403 for trainer", async () => {
    const res = await request(app)
      .get("/api/dashboard/educator-stats")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/dashboard/trainer-stats returns 500 on db error", async () => {
    mockDbResponses(new Error("trainer stats error"));

    const res = await request(app)
      .get("/api/dashboard/trainer-stats")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/admin/stats returns 403 for educator", async () => {
    const res = await request(app)
      .get("/api/admin/stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/notifications/:id/read returns 500 on db error", async () => {
    mockDbResponses(new Error("notification error"));

    const res = await request(app)
      .post("/api/notifications/1/read")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});