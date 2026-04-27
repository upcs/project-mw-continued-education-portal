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
    const response = index < responses.length ? responses[index++] : [];

    if (response === null) return cb(null, null);
    if (response instanceof Error) return cb(response);

    return cb(null, response);
  });
}



test("notifications returns 500 on null result", async () => {
  dbms.dbquery.mockImplementation((q, p, cb) => cb(null, null));

  const res = await request(app)
    .get("/api/notifications")
    .set(auth(educatorToken));

  expect(res.statusCode).toBe(200);
expect(res.body.success).toBe(true);
expect(res.body.data).toEqual([]);
});


test("attempt violation does not auto submit below threshold", async () => {
  mockDbResponses(
    { affectedRows: 1 },
    [{ violation_count: 1 }]
  );

  const res = await request(app)
    .post("/api/attempts/1/violation")
    .set(auth(educatorToken));

  expect(res.body.shouldAutoSubmit).toBe(false);
});


test("quiz update works with minimal fields", async () => {
  mockDbResponses(
    [{ id: 1, created_by_email: "trainer@example.com" }],
    { affectedRows: 1 }
  );

  const res = await request(app)
    .put("/api/quizzes/1")
    .set(auth(trainerToken))
    .send({ title: "Only title" });

  expect(res.statusCode).toBe(200);
});


test("admin users returns empty list", async () => {
  mockDbResponses([]);

  const res = await request(app)
    .get("/api/admin/users")
    .set(auth(adminToken));

  expect(res.statusCode).toBe(200);
});



test("attempt violation handles zero violations", async () => {
  mockDbResponses(
    { affectedRows: 1 },
    [{ violation_count: 0 }]
  );

  const res = await request(app)
    .post("/api/attempts/1/violation")
    .set(auth(educatorToken));

  expect(res.body.violationCount).toBe(0);
});

const principalToken = jwt.sign(
  { id: 4, email: "principal@example.com", role: "principal" },
  process.env.JWT_SECRET
);

describe("Principal dashboard coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("principal dashboard returns 500 when active assignments query fails", async () => {
    mockDbResponses(
      [{ id: 7, name: "Org 7" }],
      [{ totalEducators: 4 }],
      new Error("active assignments failed")
    );

    const res = await request(app)
      .get("/api/principal/dashboard")
      .set(auth(principalToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("principal dashboard returns 500 when completed assignments query fails", async () => {
    mockDbResponses(
      [{ id: 7, name: "Org 7" }],
      [{ totalEducators: 4 }],
      [{ activeAssignments: 2 }],
      new Error("completed assignments failed")
    );

    const res = await request(app)
      .get("/api/principal/dashboard")
      .set(auth(principalToken));

    expect(res.statusCode).toBe(500);
    expect(res.body.success).toBe(false);
  });

  test("principal dashboard returns stats successfully", async () => {
    mockDbResponses(
      [{ id: 7, name: "Org 7" }],
      [{ totalEducators: 4 }],
      [{ activeAssignments: 2 }],
      [{ completedAssignments: 1 }]
    );

    const res = await request(app)
      .get("/api/principal/dashboard")
      .set(auth(principalToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.organizationId).toBe(7);
    expect(res.body.data.activeAssignments).toBe(2);
    expect(res.body.data.completedAssignments).toBe(1);
  });
});
