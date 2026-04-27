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

function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

function mockDbResponses(...responses) {
  let i = 0;
  dbms.dbquery.mockImplementation((q, p, cb) => {
    const callback = typeof p === "function" ? p : cb;
    const res = i < responses.length ? responses[i++] : [];
    if (res instanceof Error) return callback(res);
    return callback(null, res);
  });
}

describe("Submit attempt coverage", () => {
  beforeEach(() => jest.clearAllMocks());

  test("fails if attempt already submitted", async () => {
    mockDbResponses([{ status: "submitted" }]);

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(400);
  });

  test("fails if quiz not found", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      []
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(404);
  });

  test("fails if no questions", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      [{ id: 1 }],
      []
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({ answers: [] });

    expect(res.statusCode).toBe(400);
  });

  test("handles multiple choice correct", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      [{ id: 1, pass_percentage: 50 }],
      [{ id: 10, question_type: "multiple_choice", points: 10 }],
      [{ id: 1, question_id: 10, is_correct: 1 }],
      {},
      {},
      {}
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({
        answers: [{ question_id: 10, selected_choice_id: 1 }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.earned_points).toBeGreaterThan(0);
  });

  test("handles fill_blank wrong", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      [{ id: 1, pass_percentage: 50 }],
      [{ id: 10, question_type: "fill_blank", correct_text: "abc", points: 10 }],
      [],
      {},
      {},
      {}
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({
        answers: [{ question_id: 10, answer_text: "wrong" }]
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.earned_points).toBe(0);
  });

  test("fails when insert answers fails", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      [{ id: 1 }],
      [{ id: 10, question_type: "multiple_choice", points: 10 }],
      [{ id: 1, question_id: 10, is_correct: 1 }],
      {},
      new Error("insert fail")
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({
        answers: [{ question_id: 10, selected_choice_id: 1 }]
      });

    expect(res.statusCode).toBe(500);
  });

  test("fails when finalize fails", async () => {
    mockDbResponses(
      [{ status: "in_progress", quiz_id: 1 }],
      [{ id: 1 }],
      [{ id: 10, question_type: "multiple_choice", points: 10 }],
      [{ id: 1, question_id: 10, is_correct: 1 }],
      {},
      {},
      new Error("finalize fail")
    );

    const res = await request(app)
      .post("/api/attempts/1/submit")
      .set(auth(educatorToken))
      .send({
        answers: [{ question_id: 10, selected_choice_id: 1 }]
      });

    expect(res.statusCode).toBe(500);
  });
});