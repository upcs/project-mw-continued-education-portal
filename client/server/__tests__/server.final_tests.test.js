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

describe("Final coverage push", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("profile photo upload returns 500 when db update fails", async () => {
    mockDbResponses(new Error("photo update failed"));

    const res = await request(app)
      .post("/api/profile/upload-photo")
      .set(auth(educatorToken))
      .attach("photo", Buffer.from("fake image"), "avatar.png");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("course upload rejects unsupported resource type", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "Bad Resource")
      .field("instructor", "Trainer")
      .field("resourceType", "bad");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module create rejects missing title", async () => {
    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module create rejects bad resource type", async () => {
    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "bad");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module create returns 500 when course check fails", async () => {
    mockDbResponses(new Error("course check failed"));

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module create returns 500 when position query fails", async () => {
    mockDbResponses([{ id: 1 }], new Error("position failed"));

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module create returns 500 when insert fails", async () => {
    mockDbResponses(
      [{ id: 1 }],
      [{ nextPosition: 1 }],
      new Error("module insert failed")
    );

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module create returns 500 when recalculate fails", async () => {
    mockDbResponses(
      [{ id: 1 }],
      [{ nextPosition: 1 }],
      { insertId: 5 },
      new Error("recalculate failed")
    );

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module upload rejects invalid module id", async () => {
    const res = await request(app)
      .post("/api/modules/abc/upload")
      .set(auth(trainerToken))
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module upload rejects invalid resource type", async () => {
    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("resourceType", "bad");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module upload rejects file resource without file", async () => {
    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("resourceType", "file");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module upload rejects invalid URL resource", async () => {
    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("resourceType", "url")
      .field("resourceUrl", "not-a-url");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module upload returns 500 when module check fails", async () => {
    mockDbResponses(new Error("module check failed"));

    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("module upload returns 500 when update fails", async () => {
    mockDbResponses([{ id: 1 }], new Error("module update failed"));

    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 400 for invalid module id", async () => {
    const res = await request(app)
      .post("/api/modules/abc/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 500 when module check fails", async () => {
    mockDbResponses(new Error("module check failed"));

    const res = await request(app)
      .post("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 404 when module missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 500 when quiz lookup fails", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      new Error("quiz lookup failed")
    );

    const res = await request(app)
      .post("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder post returns 500 when quiz creation fails", async () => {
    mockDbResponses(
      [{ id: 5, course_id: 1, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      [],
      new Error("quiz create failed")
    );

    const res = await request(app)
      .post("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns 400 for invalid module id", async () => {
    const res = await request(app)
      .get("/api/modules/abc/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns 500 when module query fails", async () => {
    mockDbResponses(new Error("module query failed"));

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns 404 when module missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns 404 when quiz definition missing", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      []
    );

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("quiz builder get returns 500 when questions query fails", async () => {
    mockDbResponses(
      [{ id: 5, title: "Quiz", type: "quiz", created_by_email: "trainer@example.com" }],
      [{ id: 10, module_id: 5, title: "Quiz" }],
      new Error("questions failed")
    );

    const res = await request(app)
      .get("/api/modules/5/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("put quiz rejects invalid quiz id", async () => {
    const res = await request(app)
      .put("/api/quizzes/abc")
      .set(auth(trainerToken))
      .send({ title: "Quiz" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("put quiz returns 500 when lookup fails", async () => {
    mockDbResponses(new Error("quiz lookup failed"));

    const res = await request(app)
      .put("/api/quizzes/1")
      .set(auth(trainerToken))
      .send({ title: "Quiz" });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz question rejects invalid quiz id", async () => {
    const res = await request(app)
      .post("/api/quizzes/abc/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "multiple_choice",
        prompt: "Q?",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("quiz question returns 500 when quiz lookup fails", async () => {
    mockDbResponses(new Error("question lookup failed"));

    const res = await request(app)
      .post("/api/quizzes/1/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "multiple_choice",
        prompt: "Q?",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("quiz question returns 404 when quiz missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/quizzes/1/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "multiple_choice",
        prompt: "Q?",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

test("server loads even without JWT_SECRET (dotenv fallback)", () => {
  const old = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  jest.resetModules();
  const app = require("../server");

  expect(app).toBeDefined();

  process.env.JWT_SECRET = old;
});

test("returns 401 when req.user is missing", async () => {
  const res = await request(app)
    .get("/api/dashboard/trainer-stats"); // protected route

  expect(res.statusCode).toBe(401);
});


test("rejects unsupported protocol", async () => {
  const res = await request(app)
    .post("/api/modules/1/upload")
    .set(auth(trainerToken))
    .field("resourceType", "url")
    .field("resourceUrl", "ftp://example.com/file");

  expect(res.statusCode).toBe(400);
});


test("handles youtu.be short url", async () => {
  mockDbResponses([{ id: 1 }], { affectedRows: 1 });

  const res = await request(app)
    .post("/api/modules/1/upload")
    .set(auth(trainerToken))
    .field("resourceType", "url")
    .field("resourceUrl", "https://youtu.be/dQw4w9WgXcQ");

  expect(res.statusCode).toBe(200);
});

test("handles invalid URL parsing error", async () => {
  const res = await request(app)
    .post("/api/modules/1/upload")
    .set(auth(trainerToken))
    .field("resourceType", "url")
    .field("resourceUrl", "::::invalid-url::::");

  expect(res.statusCode).toBe(400);
});



