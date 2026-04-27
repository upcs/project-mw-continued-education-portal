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

const trainerToken = jwt.sign(
  { id: 2, email: "trainer@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

const educatorToken = jwt.sign(
  { id: 3, email: "educator@example.com", role: "educator" },
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

describe("More backend API coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /api/courses/upload creates URL course", async () => {
    mockDbResponses({ insertId: 101 });

    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "URL Course")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "https://www.youtube.com/watch?v=dQw4w9WgXcQ");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.courseId).toBe(101);
    expect(res.body.data.embed_url).toContain("youtube.com/embed");
  });

  test("POST /api/courses/upload returns 400 for missing title", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/upload returns 400 for invalid URL", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "Bad URL Course")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "not-a-url");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/upload returns 400 when file resource has no file", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "File Course")
      .field("instructor", "Trainer")
      .field("resourceType", "file");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:courseId/enroll succeeds", async () => {
    mockDbResponses(
      [{ organization_id: 7 }],
      [{ id: 1 }],
      { insertId: 1 }
    );

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/courses/:courseId/enroll handles duplicate enrollment", async () => {
    const duplicateError = new Error("Duplicate");
    duplicateError.code = "ER_DUP_ENTRY";

    mockDbResponses(
      [{ organization_id: 7 }],
      [{ id: 1 }],
      duplicateError
    );

    const res = await request(app)
      .post("/api/courses/1/enroll")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:id/modules creates URL module", async () => {
    mockDbResponses(
      [{ id: 1 }],
      [{ nextPosition: 2 }],
      { insertId: 55 },
      [{ lessons: 3, quizzes: 1 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Module URL")
      .field("type", "lesson")
      .field("content", "Watch this")
      .field("resourceType", "url")
      .field("resourceUrl", "https://vimeo.com/123456");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.embed_url).toContain("player.vimeo.com");
  });

  test("POST /api/courses/:id/modules returns 400 for invalid course id", async () => {
    const res = await request(app)
      .post("/api/courses/abc/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/courses/:id/modules returns 404 when course missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/courses/999/modules")
      .set(auth(trainerToken))
      .field("title", "Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/modules/:moduleId/upload updates module URL", async () => {
    mockDbResponses([{ id: 10 }], { affectedRows: 1 });

    const res = await request(app)
      .post("/api/modules/10/upload")
      .set(auth(trainerToken))
      .field("content", "Updated resource")
      .field("resourceType", "url")
      .field("resourceUrl", "https://drive.google.com/file/d/abc123/view");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.embed_url).toContain("drive.google.com/file/d/abc123/preview");
  });

  test("POST /api/modules/:moduleId/upload returns 404 when module missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/modules/999/upload")
      .set(auth(trainerToken))
      .field("content", "Updated resource")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("POST /api/modules/:moduleId/quiz-builder creates quiz definition", async () => {
    mockDbResponses(
      [
        {
          id: 10,
          course_id: 1,
          title: "Quiz Module",
          type: "quiz",
          created_by_email: "trainer@example.com",
        },
      ],
      [],
      { insertId: 77 }
    );

    const res = await request(app)
      .post("/api/modules/10/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(77);
  });

  test("POST /api/modules/:moduleId/quiz-builder returns existing quiz", async () => {
    mockDbResponses(
      [
        {
          id: 10,
          course_id: 1,
          title: "Quiz Module",
          type: "quiz",
          created_by_email: "trainer@example.com",
        },
      ],
      [
        {
          id: 77,
          module_id: 10,
          title: "Existing Quiz",
        },
      ]
    );

    const res = await request(app)
      .post("/api/modules/10/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe("Existing Quiz");
  });

  test("POST /api/modules/:moduleId/quiz-builder returns 400 for non-quiz module", async () => {
    mockDbResponses([
      {
        id: 10,
        type: "lesson",
        created_by_email: "trainer@example.com",
      },
    ]);

    const res = await request(app)
      .post("/api/modules/10/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/modules/:moduleId/quiz-builder returns quiz with choices", async () => {
    mockDbResponses(
      [
        {
          id: 10,
          title: "Quiz Module",
          type: "quiz",
          created_by_email: "trainer@example.com",
        },
      ],
      [
        {
          id: 77,
          module_id: 10,
          title: "Quiz",
        },
      ],
      [
        {
          id: 1,
          quiz_id: 77,
          question_type: "multiple_choice",
          prompt: "Question?",
          points: 5,
          sort_order: 1,
        },
      ],
      [
        {
          id: 99,
          question_id: 1,
          choice_text: "Answer",
          is_correct: 1,
          sort_order: 1,
        },
      ]
    );

    const res = await request(app)
      .get("/api/modules/10/quiz-builder")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions[0].choices.length).toBe(1);
  });

  test("PUT /api/quizzes/:quizId updates quiz", async () => {
    mockDbResponses(
      [
        {
          id: 77,
          module_id: 10,
          created_by_email: "trainer@example.com",
        },
      ],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .put("/api/quizzes/77")
      .set(auth(trainerToken))
      .send({
        title: "Updated Quiz",
        instructions: "Answer all questions",
        pass_percentage: 80,
        time_limit_minutes: 30,
        is_published: true,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/quizzes/:quizId returns 404 when quiz missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .put("/api/quizzes/999")
      .set(auth(trainerToken))
      .send({
        title: "Missing Quiz",
      });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("GET /api/courses/enrolled returns trainer contributed courses", async () => {
    mockDbResponses([
      {
        id: 1,
        title: "Trainer Course",
        contributed_type: "Uploaded Course",
      },
    ]);

    const res = await request(app)
      .get("/api/courses/enrolled")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].contributed_type).toBe("Uploaded Course");
  });

  test("GET /api/courses/enrolled returns admin-as-trainer courses", async () => {
    mockDbResponses([
      {
        id: 1,
        title: "Admin Trainer Course",
        contributed_type: "Added Quiz",
      },
    ]);

    const res = await request(app)
      .get("/api/courses/enrolled?asTrainer=true&trainerEmail=trainer@example.com")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/admin/users/:email/organization succeeds", async () => {
    mockDbResponses({ affectedRows: 1 });

    const res = await request(app)
      .put("/api/admin/users/user@example.com/organization")
      .set(auth(adminToken))
      .send({ organizationId: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/admin/users/:email/organization returns 404 when profile missing", async () => {
    mockDbResponses({ affectedRows: 0 });

    const res = await request(app)
      .put("/api/admin/users/missing@example.com/organization")
      .set(auth(adminToken))
      .send({ organizationId: 3 });

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("Quiz attempt violation lookup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 for invalid attempt id", async () => {
    const res = await request(app)
      .post("/api/attempts/abc/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("returns 500 when update query fails", async () => {
    mockDbResponses(new Error("update failed"));

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("returns 500 when lookup query fails", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      new Error("lookup failed")
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("returns 500 when lookup result is null", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      null
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("returns 500 when lookup result is empty", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      []
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("returns violation count and does not auto-submit below 2", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      [{ violation_count: 1 }]
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.violationCount).toBe(1);
    expect(res.body.shouldAutoSubmit).toBe(false);
  });

  test("returns shouldAutoSubmit true at 2 violations", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      [{ violation_count: 2 }]
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.violationCount).toBe(2);
    expect(res.body.shouldAutoSubmit).toBe(true);
  });

  test("defaults violation count to 0 when DB value missing", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      [{}]
    );

    const res = await request(app)
      .post("/api/attempts/1/violation")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.violationCount).toBe(0);
    expect(res.body.shouldAutoSubmit).toBe(false);
  });
});

test("returns 401 without token", async () => {
  const res = await request(app)
    .post("/api/attempts/1/violation");

  expect(res.statusCode).toBe(401);
  expect(res.body.success).toBe(false);
});
test("returns 401 with invalid token", async () => {
  const res = await request(app)
    .post("/api/attempts/1/violation")
    .set("Authorization", "Bearer bad-token");

  expect(res.statusCode).toBe(401);
  expect(res.body.success).toBe(false);
});


test("returns 403 when user is not educator", async () => {
  const res = await request(app)
    .post("/api/attempts/1/violation")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(403);
  expect(res.body.success).toBe(false);
});



////////////////////////////////////////
