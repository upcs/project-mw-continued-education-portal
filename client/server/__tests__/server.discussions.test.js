process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const educatorToken = jwt.sign(
  { id: 1, email: "educator@example.com", role: "educator" },
  process.env.JWT_SECRET
);

   const adminToken = jwt.sign(
  { id: 2, email: "admin@example.com", role: "admin" },
  process.env.JWT_SECRET
);

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

describe("Discussion API coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/discussions returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/discussions")
      .set(auth(educatorToken))
      .send({ question: "Question text" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/discussions returns 400 when question is missing", async () => {
    const res = await request(app)
      .post("/api/discussions")
      .set(auth(educatorToken))
      .send({ title: "Title" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/discussions returns 500 when insert fails", async () => {
    mockDbResponses(new Error("discussion insert failed"));

    const res = await request(app)
      .post("/api/discussions")
      .set(auth(educatorToken))
      .send({
        title: "Discussion title",
        question: "Discussion question",
      });

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/discussions creates discussion", async () => {
    mockDbResponses({ insertId: 10 });

    const res = await request(app)
      .post("/api/discussions")
      .set(auth(educatorToken))
      .send({
        title: "Discussion title",
        question: "Discussion question",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.discussionId).toBe(10);
  });

  test("GET /api/discussions/:id returns 500 when discussion lookup fails", async () => {
    mockDbResponses(new Error("discussion lookup failed"));

    const res = await request(app)
      .get("/api/discussions/1")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/discussions/:id returns 404 when discussion missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .get("/api/discussions/1")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/discussions/:id returns 500 when replies lookup fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          title: "Title",
          question: "Question",
          author_email: "educator@example.com",
        },
      ],
      new Error("replies lookup failed")
    );

    const res = await request(app)
      .get("/api/discussions/1")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/discussions/:id returns discussion with empty replies", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          title: "Title",
          question: "Question",
          author_email: "educator@example.com",
        },
      ],
      null
    );

    const res = await request(app)
      .get("/api/discussions/1")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.replies).toEqual([]);
  });

  test("GET /api/discussions/:id returns discussion with replies", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          title: "Title",
          question: "Question",
          author_email: "educator@example.com",
        },
      ],
      [
        {
          id: 2,
          discussion_id: 1,
          reply: "Reply text",
          author_email: "educator@example.com",
        },
      ]
    );

    const res = await request(app)
      .get("/api/discussions/1")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.replies.length).toBe(1);
  });

  test("POST /api/discussions/:id/replies returns 400 for invalid id", async () => {
    const res = await request(app)
      .post("/api/discussions/abc/replies")
      .set(auth(educatorToken))
      .send({ reply: "Reply text" });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/discussions/:id/replies returns 400 for empty reply", async () => {
    const res = await request(app)
      .post("/api/discussions/1/replies")
      .set(auth(educatorToken))
      .send({ reply: "   " });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Final missing branches", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =====================
  // DISCUSSION REPLIES
  // =====================

  test("reply returns 500 when owner lookup fails", async () => {
    mockDbResponses(new Error("owner failed"));

    const res = await request(app)
      .post("/api/discussions/1/replies")
      .set(auth(educatorToken))
      .send({ reply: "Hello" });

   

    expect(res.statusCode).toBe(500);
  });

  test("reply returns 404 when discussion not found", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/discussions/1/replies")
      .set(auth(educatorToken))
      .send({ reply: "Hello" });

    expect(res.statusCode).toBe(404);
  });

  test("reply returns 500 when insert fails", async () => {
    mockDbResponses(
      [{ author_email: "other@example.com" }],
      new Error("insert failed")
    );

    const res = await request(app)
      .post("/api/discussions/1/replies")
      .set(auth(educatorToken))
      .send({ reply: "Hello" });

    expect(res.statusCode).toBe(500);
  });

  test("reply skips notification when replying to own discussion", async () => {
    mockDbResponses(
      [{ author_email: "educator@example.com" }],
      { insertId: 5 }
    );

    const res = await request(app)
      .post("/api/discussions/1/replies")
      .set(auth(educatorToken))
      .send({ reply: "My own reply" });

    expect(res.statusCode).toBe(201);
    expect(res.body.replyId).toBe(5);
  });

  

  // =====================
  // PROFILE VIEW
  // =====================

  test("profile view returns 400 when email missing", async () => {
    const res = await request(app)
      .get("/api/profile/view")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
  });

  test("profile view returns 500 on db error", async () => {
    mockDbResponses(new Error("profile failed"));

    const res = await request(app)
      .get("/api/profile/view?email=test@example.com")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
  });

  test("profile view returns 404 when not found", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .get("/api/profile/view?email=test@example.com")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
  });

  test("profile view returns success", async () => {
    mockDbResponses([
      { email: "test@example.com", fullname: "Test User" }
    ]);

    const res = await request(app)
      .get("/api/profile/view?email=test@example.com")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // =====================
  // ADMIN STATS ERROR
  // =====================

  test("admin stats returns 500 when users query fails", async () => {
    mockDbResponses(new Error("users failed"));

    const res = await request(app)
      .get("/api/admin/stats")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(500);
  });
});

test.skip("reply sends notification and succeeds", async () => {
  mockDbResponses(
    [{ author_email: "other@example.com" }],
    { insertId: 6 },
    { insertId: 99 }
  );

  const res = await request(app)
    .post("/api/discussions/1/replies")
    .set(auth(educatorToken))
    .send({ reply: "Hello" });

  expect(res.statusCode).toBe(201);
  expect(res.body.success).toBe(true);
});