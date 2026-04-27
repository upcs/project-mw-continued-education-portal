process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const trainerToken = jwt.sign(
  { id: 1, email: "trainer@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

const otherTrainerToken = jwt.sign(
  { id: 2, email: "other@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

const educatorToken = jwt.sign(
  { id: 3, email: "educator@example.com", role: "educator" },
  process.env.JWT_SECRET
);

const adminToken = jwt.sign(
  { id: 99, email: "admin@example.com", role: "admin" },
  process.env.JWT_SECRET
);

const principalToken = jwt.sign(
  { id: 50, email: "principal@example.com", role: "principal" },
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

describe.skip("Quiz question delete coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("delete question returns 400 for invalid id", async () => {
    const res = await request(app)
      .delete("/api/quiz-questions/abc")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 500 when lookup fails", async () => {
    mockDbResponses(new Error("lookup failed"));

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 404 when not found", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 403 when not allowed", async () => {
    mockDbResponses([
      {
        id: 1,
        quiz_id: 1,
        module_id: 5,
        created_by_email: "trainer@example.com",
      },
    ]);

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(otherTrainerToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 500 when deleting choices fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      new Error("delete choices failed")
    );

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 500 when deleting question fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      { affectedRows: 1 },
      new Error("delete question failed")
    );

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("delete question returns 500 when recalculation fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      { affectedRows: 1 },
      { affectedRows: 1 },
      new Error("recalculate failed")
    );

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("delete question succeeds", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      { affectedRows: 1 },
      { affectedRows: 1 },
      [{ totalPoints: 0 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .delete("/api/quiz-questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe("Take quiz coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("take quiz returns 400 for invalid module id", async () => {
    const res = await request(app)
      .get("/api/modules/abc/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns 500 when quiz lookup fails", async () => {
    mockDbResponses(new Error("quiz lookup failed"));

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns 404 when quiz missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns 403 when not published", async () => {
    mockDbResponses([
      {
        quiz_id: 1,
        module_id: 1,
        course_id: 1,
        is_published: 0,
      },
    ]);

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns 500 when latest attempt query fails", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      new Error("attempt query failed")
    );

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns 500 when questions query fails", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [],
      new Error("questions failed")
    );

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns empty questions", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [],
      []
    );

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions).toEqual([]);
  });

  test("take quiz returns 500 when choices query fails", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [],
      [{ id: 10, question_type: "multiple_choice", prompt: "Q?", points: 1 }],
      new Error("choices failed")
    );

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("take quiz returns questions with choices", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [{ id: 99, status: "submitted" }],
      [{ id: 10, question_type: "multiple_choice", prompt: "Q?", points: 1 }],
      [{ id: 20, question_id: 10, choice_text: "A", sort_order: 1 }]
    );

    const res = await request(app)
      .get("/api/modules/1/take-quiz")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.questions[0].choices.length).toBe(1);
  });
});

describe("Start quiz attempt coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("start attempt returns 400 for invalid module id", async () => {
    const res = await request(app)
      .post("/api/modules/abc/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 500 when quiz lookup fails", async () => {
    mockDbResponses(new Error("quiz lookup failed"));

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 404 when quiz missing", async () => {
    mockDbResponses([]);

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 403 when quiz not published", async () => {
    mockDbResponses([
      {
        quiz_id: 1,
        module_id: 1,
        course_id: 1,
        is_published: 0,
      },
    ]);

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 500 when latest attempt query fails", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      new Error("latest attempt failed")
    );

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 403 when locked", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [
        {
          locked_until: new Date(Date.now() + 100000).toISOString(),
        },
      ]
    );

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("start attempt returns 500 when insert fails", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [],
      new Error("insert attempt failed")
    );

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("start attempt succeeds", async () => {
    mockDbResponses(
      [
        {
          quiz_id: 1,
          module_id: 1,
          course_id: 1,
          is_published: 1,
        },
      ],
      [],
      { insertId: 123 }
    );

    const res = await request(app)
      .post("/api/modules/1/attempts/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.attemptId).toBe(123);
  });
});


test("member requests returns success", async () => {
  mockDbResponses([{ email: "a@test.com" }]);

  const res = await request(app)
    .get("/api/admin/member-requests")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});

test("member requests returns 500 on db error", async () => {
  mockDbResponses(new Error("fail"));

  const res = await request(app)
    .get("/api/admin/member-requests")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(500);
});



test("update role invalid role", async () => {
  const res = await request(app)
    .put("/api/admin/users/a@test.com/role")
    .set(auth(adminToken))
    .send({ role: "bad" });

  expect(res.statusCode).toBe(400);
});

test("update role success", async () => {
  mockDbResponses({ affectedRows: 1 });

  const res = await request(app)
    .put("/api/admin/users/a@test.com/role")
    .set(auth(adminToken))
    .send({ role: "trainer" });

  expect(res.statusCode).toBe(200);
});

test("update role 404", async () => {
  mockDbResponses({ affectedRows: 0 });

  const res = await request(app)
    .put("/api/admin/users/a@test.com/role")
    .set(auth(adminToken))
    .send({ role: "trainer" });

  expect(res.statusCode).toBe(404);
});






test("create org missing name", async () => {
  const res = await request(app)
    .post("/api/admin/organizations")
    .set(auth(adminToken))
    .send({});

  expect(res.statusCode).toBe(400);
});

test("create org success", async () => {
  mockDbResponses({ insertId: 1 });

  const res = await request(app)
    .post("/api/admin/organizations")
    .set(auth(adminToken))
    .send({ name: "Test Org" });

  expect(res.statusCode).toBe(200);
});



test("get organizations success", async () => {
  mockDbResponses([{ id: 1, name: "Org" }]);

  const res = await request(app)
    .get("/api/admin/organizations")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(200);
});



test("delete user success", async () => {
  mockDbResponses(
    {}, // assignments
    {}, // submissions
    {}, // profile
    { affectedRows: 1 } // user
  );

  const res = await request(app)
    .delete("/api/admin/users/a@test.com")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(200);
});

test("delete user not found", async () => {
  mockDbResponses(
    {},
    {},
    {},
    { affectedRows: 0 }
  );

  const res = await request(app)
    .delete("/api/admin/users/a@test.com")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(404);
});



test("update role returns 500 on db error", async () => {
  mockDbResponses(new Error("role update failed"));

  const res = await request(app)
    .put("/api/admin/users/user@example.com/role")
    .set(auth(adminToken))
    .send({ role: "trainer" });

  expect(res.statusCode).toBe(500);
});

test("create organization returns 500 on db error", async () => {
  mockDbResponses(new Error("org create failed"));

  const res = await request(app)
    .post("/api/admin/organizations")
    .set(auth(adminToken))
    .send({ name: "Test Org" });

  expect(res.statusCode).toBe(500);
});

test("get organizations returns 500 on db error", async () => {
  mockDbResponses(new Error("org fetch failed"));

  const res = await request(app)
    .get("/api/admin/organizations")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(500);
});

test("assign principal returns 400 for invalid org id", async () => {
  const res = await request(app)
    .put("/api/admin/organizations/abc/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(400);
});

test("assign principal returns 500 when org check fails", async () => {
  mockDbResponses(new Error("org check failed"));

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(500);
});

test("assign principal returns 404 when org missing", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(404);
});

test("remove principal succeeds when no previous principal", async () => {
  mockDbResponses([{ id: 1, name: "Org", principal_email: null }], { affectedRows: 1 });

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "" });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});

test("remove principal returns 500 when clear org fails", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: "old@example.com" }],
    new Error("clear org failed")
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "" });

  expect(res.statusCode).toBe(500);
});

test("remove principal returns 500 when clear profile fails", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: "old@example.com" }],
    { affectedRows: 1 },
    new Error("clear profile failed")
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "" });

  expect(res.statusCode).toBe(500);
});

test("assign principal returns 500 when principal check fails", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: null }],
    new Error("principal check failed")
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(500);
});

test("assign principal returns 404 when principal missing", async () => {
  mockDbResponses([{ id: 1, name: "Org", principal_email: null }], []);

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(404);
});

test("assign principal returns 400 when user is not principal", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: null }],
    [{ email: "trainer@example.com", role: "trainer" }]
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "trainer@example.com" });

  expect(res.statusCode).toBe(400);
});

test("assign principal returns 400 when already assigned elsewhere", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: null }],
    [{ email: "principal@example.com", role: "principal" }],
    [{ id: 2 }]
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(400);
});

test("assign principal succeeds", async () => {
  mockDbResponses(
    [{ id: 1, name: "Org", principal_email: "old@example.com" }],
    [{ email: "principal@example.com", role: "principal" }],
    [],
    { affectedRows: 1 },
    { affectedRows: 1 },
    { affectedRows: 1 },
    { insertId: 99 }
  );

  const res = await request(app)
    .put("/api/admin/organizations/1/principal")
    .set(auth(adminToken))
    .send({ principalEmail: "principal@example.com" });

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});


test("principal educators returns 500 on org error", async () => {
  mockDbResponses(new Error("org fail"));

  const res = await request(app)
    .get("/api/principal/educators")
    .set(auth(principalToken));

  expect(res.statusCode).toBe(500);
});

test("principal educators returns 404 when no org", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .get("/api/principal/educators")
    .set(auth(principalToken));

  expect(res.statusCode).toBe(404);
});

test("principal educators returns success", async () => {
  mockDbResponses(
    [{ id: 1 }],
    [{ email: "e@test.com", averageGrade: 80 }]
  );

  const res = await request(app)
    .get("/api/principal/educators")
    .set(auth(principalToken));

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});


test("assign course returns 400 invalid input", async () => {
  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({});

  expect(res.statusCode).toBe(400);
});

test("assign course returns 500 on org error", async () => {
  mockDbResponses(new Error("org fail"));

  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({ educatorEmail: "e@test.com", courseId: 1 });

  expect(res.statusCode).toBe(500);
});

test("assign course returns 403 when educator not in org", async () => {
  mockDbResponses([{ id: 1 }], []);

  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({ educatorEmail: "e@test.com", courseId: 1 });

  expect(res.statusCode).toBe(403);
});

test("assign course returns 404 when course missing", async () => {
  mockDbResponses(
    [{ id: 1 }],
    [{ email: "e@test.com" }],
    []
  );

  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({ educatorEmail: "e@test.com", courseId: 1 });

  expect(res.statusCode).toBe(404);
});

test("assign course duplicate entry", async () => {
  const duplicateError = new Error("duplicate");
  duplicateError.code = "ER_DUP_ENTRY";

  mockDbResponses(
    [{ id: 1 }],
    [{ email: "e@test.com" }],
    [{ id: 1 }],
    duplicateError
  );

  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({ educatorEmail: "e@test.com", courseId: 1 });

  expect(res.statusCode).toBe(400);
});

test("assign course success", async () => {
  mockDbResponses(
    [{ id: 1 }],
    [{ email: "e@test.com" }],
    [{ id: 1 }],
    {}
  );

  const res = await request(app)
    .post("/api/principal/assign-course")
    .set(auth(principalToken))
    .send({ educatorEmail: "e@test.com", courseId: 1 });

  expect(res.statusCode).toBe(200);
});

test("notifications returns 500 on error", async () => {
  mockDbResponses(new Error("fail"));

  const res = await request(app)
    .get("/api/notifications")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(500);
});

test("unread count returns 500", async () => {
  mockDbResponses(new Error("fail"));

  const res = await request(app)
    .get("/api/notifications/unread-count")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(500);
});


test("mark read invalid id", async () => {
  const res = await request(app)
    .post("/api/notifications/abc/read")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(400);
});

test("mark read not found", async () => {
  mockDbResponses({ affectedRows: 0 });

  const res = await request(app)
    .post("/api/notifications/1/read")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(404);
});


test("delete course returns 400 invalid id", async () => {
  const res = await request(app)
    .delete("/api/courses/abc")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(400);
});

test("delete course returns 404 when not found", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .delete("/api/courses/1")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(404);
});

test("delete course returns 403 when not owner", async () => {
  mockDbResponses([{ uploaded_by_email: "other@test.com" }]);

  const res = await request(app)
    .delete("/api/courses/1")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(403);
});


test("delete question returns 400 for invalid id", async () => {
  const res = await request(app)
    .delete("/api/questions/abc")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(400);
});

test("delete question returns 404 when not found", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .delete("/api/questions/1")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(404);
});

test("delete question returns 403 when not allowed", async () => {
  mockDbResponses([
    { id: 1, quiz_id: 1, module_id: 5, created_by_email: "trainer@example.com" },
  ]);

  const res = await request(app)
    .delete("/api/questions/1")
    .set(auth(otherTrainerToken));

  expect(res.statusCode).toBe(403);
});


describe("DELETE /api/questions/:questionId deep coverage", () => {
  beforeEach(() => jest.clearAllMocks());

  test("returns 500 when deleting choices fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      new Error("choices delete failed")
    );

    const res = await request(app)
      .delete("/api/questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
  });

  test("returns 500 when deleting question fails", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          quiz_id: 1,
          module_id: 5,
          created_by_email: "trainer@example.com",
        },
      ],
      {}, // choices delete OK
      new Error("question delete failed")
    );

    const res = await request(app)
      .delete("/api/questions/1")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(500);
  });

 test("returns 500 when recalculation fails", async () => {
  mockDbResponses(
    [{ id: 1, quiz_id: 1, module_id: 5, created_by_email: "trainer@example.com" }],
    {}, // delete choices
    {}, // delete question
    new Error("recalc failed") // recalculateQuizTotalPoints first query fails
  );

  const res = await request(app)
    .delete("/api/questions/1")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(500);
});

test("delete question full success", async () => {
  mockDbResponses(
    [{ id: 1, quiz_id: 1, module_id: 5, created_by_email: "trainer@example.com" }],
    {}, // delete choices
    {}, // delete question
    [{ totalPoints: 0 }], // recalculateQuizTotalPoints SELECT
    {} // recalculateQuizTotalPoints UPDATE
  );

  const res = await request(app)
    .delete("/api/questions/1")
    .set(auth(trainerToken));

  expect(res.statusCode).toBe(200);
  expect(res.body.success).toBe(true);
});


});
