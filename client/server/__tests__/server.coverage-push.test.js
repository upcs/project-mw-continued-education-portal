process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const adminToken = jwt.sign({ id: 1, email: "admin@example.com", role: "admin" }, process.env.JWT_SECRET);
const trainerToken = jwt.sign({ id: 2, email: "trainer@example.com", role: "trainer" }, process.env.JWT_SECRET);
const otherTrainerToken = jwt.sign({ id: 3, email: "other@example.com", role: "trainer" }, process.env.JWT_SECRET);
const educatorToken = jwt.sign({ id: 4, email: "educator@example.com", role: "educator" }, process.env.JWT_SECRET);
const principalToken = jwt.sign({ id: 5, email: "principal@example.com", role: "principal" }, process.env.JWT_SECRET);

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

describe("Coverage push to 60 percent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("login returns 500 on db error", async () => {
    mockDbResponses(new Error("login db failed"));

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "123456" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("login returns 403 when account is pending", async () => {
    const hash = await bcrypt.hash("123456", 10);

    mockDbResponses([
      {
        id: 1,
        email: "john@example.com",
        password: hash,
        approval_status: "pending",
      },
    ]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "123456" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("login returns 403 when account is rejected", async () => {
    const hash = await bcrypt.hash("123456", 10);

    mockDbResponses([
      {
        id: 1,
        email: "john@example.com",
        password: hash,
        approval_status: "rejected",
      },
    ]);

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "john@example.com", password: "123456" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("signup returns 500 when duplicate check query fails", async () => {
    mockDbResponses(new Error("signup check failed"));

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("signup returns 500 when user insert fails", async () => {
    mockDbResponses([], new Error("user insert failed"));

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("signup returns 500 when profile insert fails", async () => {
    mockDbResponses([], { insertId: 1 }, new Error("profile insert failed"));

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "User",
        email: "user@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("auth me returns 500 on db error", async () => {
    mockDbResponses(new Error("auth me failed"));

    const res = await request(app)
      .get("/api/auth/me")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("change password returns success false when user missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/profile/change-password")
      .set(auth(educatorToken))
      .send({ oldPassword: "old", newPassword: "new" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
  });

  test("change password returns success false for wrong old password", async () => {
    const hash = await bcrypt.hash("correct-old", 10);

    mockDbResponses([{ email: "educator@example.com", password: hash }]);

    const res = await request(app)
      .post("/api/profile/change-password")
      .set(auth(educatorToken))
      .send({ oldPassword: "wrong-old", newPassword: "new" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(false);
  });

  test("change password returns 500 when update fails", async () => {
    const hash = await bcrypt.hash("old", 10);

    mockDbResponses(
      [{ email: "educator@example.com", password: hash }],
      new Error("password update failed")
    );

    const res = await request(app)
      .post("/api/profile/change-password")
      .set(auth(educatorToken))
      .send({ oldPassword: "old", newPassword: "new" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course upload file branch succeeds", async () => {
    mockDbResponses({ insertId: 201 });

    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "File Course")
      .field("instructor", "Trainer")
      .field("resourceType", "file")
      .attach("courseFile", Buffer.from("fake pdf"), "course.pdf");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_type).toContain("pdf");
  });

  test("course upload returns 500 on db error", async () => {
    mockDbResponses(new Error("course insert failed"));

    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "URL Course")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com/resource");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course modules returns 500 on db error", async () => {
    mockDbResponses(new Error("modules failed"));

    const res = await request(app).get("/api/courses/1/modules");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course details returns 500 when modules query fails", async () => {
    mockDbResponses(
      [{ id: 1, title: "Course" }],
      new Error("course modules failed")
    );

    const res = await request(app).get("/api/courses/1");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("courses enrolled fallback branch works for principal", async () => {
    mockDbResponses([{ id: 1, title: "Fallback Course" }]);

    const res = await request(app)
      .get("/api/courses/enrolled")
      .set(auth(principalToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("courses enrolled trainer branch returns 500 on db error", async () => {
    mockDbResponses(new Error("trainer courses failed"));

    const res = await request(app)
      .get("/api/courses/enrolled")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course enroll returns 500 when profile query fails", async () => {
    mockDbResponses(new Error("profile failed"));

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course enroll returns 500 when course query fails", async () => {
    mockDbResponses([{ organization_id: 7 }], new Error("course lookup failed"));

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course enroll returns 500 for non-duplicate insert error", async () => {
    mockDbResponses(
      [{ organization_id: 7 }],
      [{ id: 1 }],
      new Error("insert failed")
    );

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("check completion returns completed true at 100 percent", async () => {
    mockDbResponses(
      [{ totalQuizzes: 2 }],
      [{ passedQuizzes: 2 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/courses/1/check-completion")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.data.completed).toBe(true);
    expect(res.body.data.progress).toBe(100);
  });

  test("check completion returns 500 when passed quiz query fails", async () => {
    mockDbResponses([{ totalQuizzes: 2 }], new Error("passed failed"));

    const res = await request(app)
      .post("/api/courses/1/check-completion")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("check completion returns 500 when update fails", async () => {
    mockDbResponses(
      [{ totalQuizzes: 2 }],
      [{ passedQuizzes: 1 }],
      new Error("update failed")
    );

    const res = await request(app)
      .post("/api/courses/1/check-completion")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module submissions returns success", async () => {
    mockDbResponses([{ id: 1, module_id: 5, user_email: "educator@example.com" }]);

    const res = await request(app)
      .get("/api/modules/5/submissions")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("module submissions returns 500 on db error", async () => {
    mockDbResponses(new Error("module submissions failed"));

    const res = await request(app)
      .get("/api/modules/5/submissions")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("manual quiz submission returns 404 when module missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("manual quiz submission rejects non-quiz module", async () => {
    mockDbResponses([{ id: 5, course_id: 1, type: "lesson" }]);

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("manual quiz submission succeeds without trainer notification", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, type: "quiz", title: "Quiz", created_by_email: "educator@example.com" }],
      [{ nextAttempt: 2 }],
      { affectedRows: 1 },
      { insertId: 44 }
    );

    const res = await request(app)
      .post("/api/modules/5/submissions")
      .set(auth(educatorToken))
      .send({ answerText: "answer" });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.attempt_number).toBe(2);
  });

  test("my submissions returns 500 on db error", async () => {
    mockDbResponses(new Error("my submissions failed"));

    const res = await request(app)
      .get("/api/my-submissions")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("educator stats returns 500 when submitted query fails", async () => {
    mockDbResponses([{ totalQuizzes: 4 }], new Error("submitted failed"));

    const res = await request(app)
      .get("/api/dashboard/educator-stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("educator stats returns 500 when average grade query fails", async () => {
    mockDbResponses(
      [{ totalQuizzes: 4 }],
      [{ submittedQuizzes: 2 }],
      new Error("average failed")
    );

    const res = await request(app)
      .get("/api/dashboard/educator-stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("educator stats returns 500 when latest query fails", async () => {
    mockDbResponses(
      [{ totalQuizzes: 4 }],
      [{ submittedQuizzes: 2 }],
      [{ averageGrade: 90 }],
      new Error("latest failed")
    );

    const res = await request(app)
      .get("/api/dashboard/educator-stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("trainer stats returns 500 when second query fails", async () => {
    mockDbResponses([{ pendingReviews: 3 }], new Error("pending courses failed"));

    const res = await request(app)
      .get("/api/dashboard/trainer-stats")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 403 for wrong trainer", async () => {
    mockDbResponses([
      { id: 5, course_id: 1, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" },
    ]);

    const res = await request(app)
      .post("/api/modules/5/quiz-builder")
      .set(auth(otherTrainerToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns empty questions", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      [{ id: 10, module_id: 5, title: "Quiz Definition" }],
      []
    );

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toEqual([]);
  });

  test("quiz builder get returns 500 when choices query fails", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      [{ id: 10, module_id: 5, title: "Quiz Definition" }],
      [{ id: 1, quiz_id: 10, question_type: "multiple_choice", prompt: "Q" }],
      new Error("choices failed")
    );

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("put quiz returns 403 for wrong trainer", async () => {
    mockDbResponses([
      { id: 10, module_id: 5, created_by_email: "trainer@example.com" },
    ]);

    const res = await request(app)
      .put("/api/quizzes/10")
      .set(auth(otherTrainerToken))
      .send({ title: "Updated" });

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("put quiz returns 500 when update fails", async () => {
    mockDbResponses(
      [{ id: 10, module_id: 5, created_by_email: "trainer@example.com" }],
      new Error("quiz update failed")
    );

    const res = await request(app)
      .put("/api/quizzes/10")
      .set(auth(trainerToken))
      .send({ title: "Updated" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 400 for invalid module id", async () => {
    const res = await request(app)
      .post("/api/modules/abc/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 500 when quiz query fails", async () => {
    mockDbResponses(new Error("quiz query failed"));

    const res = await request(app)
      .post("/api/modules/5/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 403 when latest attempt is locked", async () => {
    mockDbResponses(
      [{ quiz_id: 10, module_id: 5, course_id: 1, is_published: 1 }],
      [{ locked_until: new Date(Date.now() + 60 * 60 * 1000).toISOString() }]
    );

    const res = await request(app)
      .post("/api/modules/5/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("start attempt succeeds", async () => {
    mockDbResponses(
      [{ quiz_id: 10, module_id: 5, course_id: 1, is_published: 1 }],
      [],
      { insertId: 99 }
    );

    const res = await request(app)
      .post("/api/modules/5/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBe(99);
  });

  test("submit attempt returns 400 for invalid attempt id", async () => {
    const res = await request(app)
      .post("/api/attempts/abc/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("submit attempt returns 500 when attempt lookup fails", async () => {
    mockDbResponses(new Error("attempt lookup failed"));

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("submit attempt returns 404 when attempt missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("attempt violation returns 500 when update fails", async () => {
    mockDbResponses(new Error("violation update failed"));

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("attempt violation returns shouldAutoSubmit true", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      [{ violation_count: 2 }]
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.shouldAutoSubmit).toBe(true);
  });

  test("trainer can view module attempts", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", created_by_email: "trainer@example.com" }],
      [{ id: 1, user_email: "educator@example.com", status: "submitted" }]
    );

    const res = await request(app)
      .get("/api/modules/5/attempts")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("module attempts returns 403 for wrong trainer", async () => {
    mockDbResponses([
      { id: 5, title: "Quiz", created_by_email: "trainer@example.com" },
    ]);

    const res = await request(app)
      .get("/api/modules/5/attempts")
      .set(auth(otherTrainerToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("module attempts returns 500 when attempts query fails", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", created_by_email: "trainer@example.com" }],
      new Error("attempt list failed")
    );

    const res = await request(app)
      .get("/api/modules/5/attempts")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });
});