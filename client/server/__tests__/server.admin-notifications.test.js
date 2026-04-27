process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const adminToken = jwt.sign({ id: 1, email: "admin@example.com", role: "admin" }, process.env.JWT_SECRET);
const trainerToken = jwt.sign({ id: 2, email: "trainer@example.com", role: "trainer" }, process.env.JWT_SECRET);
const educatorToken = jwt.sign({ id: 3, email: "educator@example.com", role: "educator" }, process.env.JWT_SECRET);

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function mockDbResponses(...responses) {
  let index = 0;

  dbms.dbquery.mockImplementation((query, params, callback) => {
    const cb = typeof params === "function" ? params : callback;
    const response = index < responses.length ? responses[index++] : [];

    if (response instanceof Error) return cb(response);
    return cb(null, response);
  });
}

describe("Coverage push 2", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("admin stats returns 500 when courses query fails", async () => {
    mockDbResponses([{ totalUsers: 1 }], new Error("courses failed"));

    const res = await request(app).get("/api/admin/stats").set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin stats returns 500 when principals query fails", async () => {
    mockDbResponses(
      [{ totalUsers: 1 }],
      [{ totalCourses: 2 }],
      new Error("principals failed")
    );

    const res = await request(app).get("/api/admin/stats").set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin stats returns 500 when organizations query fails", async () => {
    mockDbResponses(
      [{ totalUsers: 1 }],
      [{ totalCourses: 2 }],
      [{ totalPrincipals: 3 }],
      new Error("organizations failed")
    );

    const res = await request(app).get("/api/admin/stats").set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin users returns 500 on db error", async () => {
    mockDbResponses(new Error("admin users failed"));

    const res = await request(app).get("/api/admin/users").set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 400 for missing fields", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({ email: "bad@example.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 400 for invalid role", async () => {
    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "Bad User",
        email: "bad@example.com",
        password: "password123",
        role: "student",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 409 when user exists", async () => {
    mockDbResponses([{ email: "exists@example.com" }]);

    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "Exists",
        email: "exists@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 500 when check fails", async () => {
    mockDbResponses(new Error("check failed"));

    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 500 when user insert fails", async () => {
    mockDbResponses([], new Error("insert user failed"));

    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("admin create user returns 500 when profile insert fails", async () => {
    mockDbResponses([], { insertId: 1 }, new Error("insert profile failed"));

    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("accept member returns 500 on db error", async () => {
    mockDbResponses(new Error("accept failed"));

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/accept")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("accept member returns 404 when no pending request", async () => {
    mockDbResponses({ affectedRows: 0 });

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/accept")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("reject member returns 500 on db error", async () => {
    mockDbResponses(new Error("reject failed"));

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/reject")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("reject member returns 404 when no pending request", async () => {
    mockDbResponses({ affectedRows: 0 });

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/reject")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("notifications returns 500 on db error", async () => {
    mockDbResponses(new Error("notifications failed"));

    const res = await request(app)
      .get("/api/notifications")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("unread notification count returns 500 on db error", async () => {
    mockDbResponses(new Error("unread failed"));

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("notification read returns 400 for invalid id", async () => {
    const res = await request(app)
      .post("/api/notifications/abc/read")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("read all notifications returns 500 on db error", async () => {
    mockDbResponses(new Error("read all failed"));

    const res = await request(app)
      .post("/api/notifications/read-all")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course submissions returns 500 on db error", async () => {
    mockDbResponses(new Error("course submissions failed"));

    const res = await request(app)
      .get("/api/courses/1/submissions")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("grade submission returns 500 when lookup fails", async () => {
    mockDbResponses(new Error("lookup failed"));

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(trainerToken))
      .send({ status: "approved" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("grade submission returns 500 when update fails", async () => {
    mockDbResponses(
      [{ id: 1, user_email: "educator@example.com", moduleTitle: "Quiz", courseTitle: "Course" }],
      new Error("update failed")
    );

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(trainerToken))
      .send({ status: "approved" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("grade submission returns 404 when update affects no rows", async () => {
    mockDbResponses(
      [{ id: 1, user_email: "educator@example.com", moduleTitle: "Quiz", courseTitle: "Course" }],
      { affectedRows: 0 }
    );

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(trainerToken))
      .send({ status: "approved" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("grade submission succeeds even if notification fails", async () => {
    mockDbResponses(
      [{ id: 1, user_email: "educator@example.com", moduleTitle: "Quiz", courseTitle: "Course" }],
      { affectedRows: 1 },
      new Error("notification failed")
    );

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(trainerToken))
      .send({ status: "approved", grade: "90", feedback: "Good" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("manual submission returns 500 when module lookup fails", async () => {
    mockDbResponses(new Error("module lookup failed"));

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("manual submission returns 500 when attempt lookup fails", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, type: "quiz", title: "Quiz", created_by_email: "trainer@example.com" }],
      new Error("attempt lookup failed")
    );

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("manual submission returns 500 when clear latest fails", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, type: "quiz", title: "Quiz", created_by_email: "trainer@example.com" }],
      [{ nextAttempt: 1 }],
      new Error("clear latest failed")
    );

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("manual submission returns 500 when insert fails", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, type: "quiz", title: "Quiz", created_by_email: "trainer@example.com" }],
      [{ nextAttempt: 1 }],
      { affectedRows: 1 },
      new Error("insert submission failed")
    );

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

test("GET /api/dashboard/educator-stats returns 401 without token", async () => {
  const res = await request(app).get("/api/dashboard/educator-stats");
  expect(res.statusCode).toBe(401);
});

test("GET /api/modules/5/attempts returns 401 without token", async () => {
  const res = await request(app).get("/api/modules/5/attempts");
  expect(res.statusCode).toBe(401);
});

test("educator cannot access trainer stats", async () => {
  const res = await request(app)
    .get("/api/dashboard/trainer-stats")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(403);
});


test("trainer cannot access admin stats", async () => {
  const res = await request(app)
    .get("/api/admin/stats")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(403);
});


test("notifications returns empty list", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .get("/api/notifications")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});


test("module submissions returns empty list", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .get("/api/modules/5/submissions")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(200);
});


test("attempt violation returns 400 for negative id", async () => {
  const res = await request(app)
    .post("/api/attempts/-1/violation")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(400);
});


test("submit attempt missing body", async () => {
  mockDbResponses([]); // no attempt found

  const res = await request(app)
    .post("/api/attempts/1/submit")
    .set(auth(educatorToken))
    .send({});

  expect(res.statusCode).toBe(404); // ✅ FIX
});

