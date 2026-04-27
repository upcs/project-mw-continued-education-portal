process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const { detectUploadedFileType, normalizeQuizText } = app.__testHelpers;

const trainerToken = jwt.sign(
  { id: 1, email: "trainer@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

const educatorToken = jwt.sign(
  { id: 2, email: "educator@example.com", role: "educator" },
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

    if (response instanceof Error) return cb(response);

    return cb(null, response);
  });
}

describe("Helper coverage: uploaded file type and quiz text", () => {
  test("detectUploadedFileType returns empty string for missing file", () => {
    expect(detectUploadedFileType(null)).toBe("");
  });

  test("detectUploadedFileType prefers mimetype", () => {
    expect(
      detectUploadedFileType({
        originalname: "anything.unknown",
        mimetype: "image/png",
      })
    ).toBe("image/png");
  });

  test("detectUploadedFileType detects pdf", () => {
    expect(
      detectUploadedFileType({
        originalname: "lesson.pdf",
        mimetype: "",
      })
    ).toBe("application/pdf");
  });

  test("detectUploadedFileType detects txt", () => {
    expect(
      detectUploadedFileType({
        originalname: "notes.txt",
        mimetype: "",
      })
    ).toBe("text/plain");
  });

  test("detectUploadedFileType detects md", () => {
    expect(
      detectUploadedFileType({
        originalname: "readme.md",
        mimetype: "",
      })
    ).toBe("text/plain");
  });

  test("detectUploadedFileType detects docx", () => {
    expect(
      detectUploadedFileType({
        originalname: "worksheet.docx",
        mimetype: "",
      })
    ).toBe(
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  });

  test("detectUploadedFileType detects doc", () => {
    expect(
      detectUploadedFileType({
        originalname: "old-file.doc",
        mimetype: "",
      })
    ).toBe("application/msword");
  });

  test("detectUploadedFileType returns empty string for unknown extension", () => {
    expect(
      detectUploadedFileType({
        originalname: "file.xyz",
        mimetype: "",
      })
    ).toBe("");
  });

  test("normalizeQuizText trims, lowercases, and collapses spaces", () => {
    expect(normalizeQuizText("  Hello    WORLD  ")).toBe("hello world");
  });
});

describe("More quiz API coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/quizzes/:quizId/questions creates multiple choice question", async () => {
    mockDbResponses(
      [
        {
          id: 10,
          module_id: 3,
          created_by_email: "trainer@example.com",
        },
      ],
      { insertId: 100 },
      { insertId: 1 },
      { insertId: 2 },
      [{ totalPoints: 5 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/quizzes/10/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "multiple_choice",
        prompt: "What is 2 + 2?",
        points: 5,
        sort_order: 1,
        choices: [
          { choice_text: "4", is_correct: 1, sort_order: 1 },
          { choice_text: "5", is_correct: 0, sort_order: 2 },
        ],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/quizzes/:quizId/questions creates fill blank question", async () => {
    mockDbResponses(
      [
        {
          id: 10,
          module_id: 3,
          created_by_email: "trainer@example.com",
        },
      ],
      { insertId: 101 },
      [{ totalPoints: 3 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/quizzes/10/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "fill_blank",
        prompt: "The sky is ____.",
        points: 3,
        sort_order: 1,
        correct_text: "blue",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/quizzes/:quizId/questions rejects invalid question type", async () => {
    const res = await request(app)
      .post("/api/quizzes/10/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "essay",
        prompt: "Explain",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/quizzes/:quizId/questions rejects missing prompt", async () => {
    const res = await request(app)
      .post("/api/quizzes/10/questions")
      .set(auth(trainerToken))
      .send({
        question_type: "multiple_choice",
        prompt: "",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/modules/:moduleId/attempts/start rejects unpublished quiz", async () => {
    mockDbResponses([
      {
        quiz_id: 20,
        module_id: 5,
        course_id: 1,
        is_published: 0,
      },
    ]);

    const res = await request(app)
      .post("/api/modules/5/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/modules/:moduleId/attempts/start rejects missing quiz", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/modules/999/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});