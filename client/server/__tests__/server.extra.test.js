process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const bcrypt = require("bcryptjs");
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

describe("Extra Backend API coverage tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/auth/me returns current user", async () => {
    mockDbResponses([
      {
        id: 1,
        email: "admin@example.com",
        fullname: "Admin User",
        role: "admin",
      },
    ]);

    const res = await request(app)
      .get("/api/auth/me")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe("admin@example.com");
  });

  test("POST /api/auth/signup creates pending user", async () => {
    mockDbResponses([], { affectedRows: 1 }, { affectedRows: 1 });

    const res = await request(app)
      .post("/api/auth/signup")
      .send({
        fullname: "New User",
        email: "new@example.com",
        password: "password123",
        role: "educator",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/courses returns courses", async () => {
    mockDbResponses([
      {
        id: 1,
        title: "Course 1",
        instructor: "Trainer",
      },
    ]);

    const res = await request(app).get("/api/courses");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe("Course 1");
  });

  test("GET /api/courses/:id returns course details", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          title: "Course 1",
          instructor: "Trainer",
        },
      ],
      [
        {
          id: 10,
          course_id: 1,
          title: "Module 1",
        },
      ]
    );

    const res = await request(app).get("/api/courses/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modules.length).toBe(1);
  });

  test("GET /api/courses/:id/modules returns modules", async () => {
    mockDbResponses([
      {
        id: 10,
        course_id: 1,
        title: "Module 1",
      },
    ]);

    const res = await request(app).get("/api/courses/1/modules");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/courses/enrolled returns educator courses", async () => {
    mockDbResponses([
      {
        id: 1,
        title: "Assigned Course",
        progress: 20,
      },
    ]);

    const res = await request(app)
      .get("/api/courses/enrolled")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/courses/:courseId/start marks course in progress", async () => {
    mockDbResponses({ affectedRows: 1 });

    const res = await request(app)
      .post("/api/courses/1/start")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/courses/:courseId/check-completion updates progress", async () => {
    mockDbResponses(
      [{ totalQuizzes: 2 }],
      [{ passedQuizzes: 1 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/courses/1/check-completion")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progress).toBe(50);
  });

  test("GET /api/courses/:courseId/submissions returns submissions", async () => {
    mockDbResponses([
      {
        id: 1,
        user_email: "educator@example.com",
        status: "submitted",
      },
    ]);

    const res = await request(app)
      .get("/api/courses/1/submissions")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/submissions/:submissionId/grade grades submission", async () => {
    mockDbResponses(
      [
        {
          id: 1,
          user_email: "educator@example.com",
          moduleTitle: "Quiz 1",
          courseTitle: "Course 1",
        },
      ],
      { affectedRows: 1 },
      { insertId: 1 }
    );

    const res = await request(app)
      .put("/api/submissions/1/grade")
      .set(auth(adminToken))
      .send({
        status: "approved",
        grade: "95",
        feedback: "Great job",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/my-submissions returns user submissions", async () => {
    mockDbResponses([
      {
        id: "manual-1",
        user_email: "educator@example.com",
        status: "approved",
      },
    ]);

    const res = await request(app)
      .get("/api/my-submissions")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/dashboard/educator-stats returns stats", async () => {
    mockDbResponses(
      [{ totalQuizzes: 4 }],
      [{ submittedQuizzes: 2 }],
      [{ averageGrade: 85 }],
      [{ id: 1, status: "approved" }]
    );

    const res = await request(app)
      .get("/api/dashboard/educator-stats")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completionPercentage).toBe(50);
  });

  test("GET /api/dashboard/trainer-stats returns stats", async () => {
    mockDbResponses(
      [{ pendingReviews: 3 }],
      [{ course_id: 1, course_title: "Course 1", pendingCount: 3 }]
    );

    const res = await request(app)
      .get("/api/dashboard/trainer-stats")
      .set(auth(trainerToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/profile/me returns profile", async () => {
    mockDbResponses([
      {
        email: "educator@example.com",
        fullname: "Educator User",
        role: "educator",
      },
    ]);

    const res = await request(app)
      .get("/api/profile/me")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/update updates profile", async () => {
    mockDbResponses({ affectedRows: 1 });

    const res = await request(app)
      .post("/api/profile/update")
      .set(auth(educatorToken))
      .send({
        photo: "",
        fullname: "Educator User",
        whatsapp: "123456789",
        specialization: "CS",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/change-password changes password", async () => {
    const oldHash = await bcrypt.hash("old123", 10);

    mockDbResponses(
      [{ email: "educator@example.com", password: oldHash }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/profile/change-password")
      .set(auth(educatorToken))
      .send({
        oldPassword: "old123",
        newPassword: "new123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/admin/stats returns admin stats", async () => {
    mockDbResponses(
      [{ totalUsers: 10 }],
      [{ totalCourses: 5 }],
      [{ totalPrincipals: 2 }],
      [{ totalOrganizations: 3 }]
    );

    const res = await request(app)
      .get("/api/admin/stats")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalUsers).toBe(10);
  });

  test("GET /api/admin/users returns users", async () => {
    mockDbResponses([
      {
        email: "user@example.com",
        fullname: "User",
        role: "educator",
      },
    ]);

    const res = await request(app)
      .get("/api/admin/users")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/admin/users creates user", async () => {
    mockDbResponses([], { affectedRows: 1 }, { affectedRows: 1 });

    const res = await request(app)
      .post("/api/admin/users")
      .set(auth(adminToken))
      .send({
        fullname: "Created User",
        email: "created@example.com",
        password: "password123",
        role: "educator",
        organizationId: 1,
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/admin/member-requests/:email/accept accepts request", async () => {
    mockDbResponses({ affectedRows: 1 }, { insertId: 1 });

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/accept")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PUT /api/admin/member-requests/:email/reject rejects request", async () => {
    mockDbResponses({ affectedRows: 1 }, { insertId: 1 });

    const res = await request(app)
      .put("/api/admin/member-requests/new@example.com/reject")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("DELETE /api/admin/users/:email deletes user", async () => {
    mockDbResponses(
      { affectedRows: 1 },
      { affectedRows: 1 },
      { affectedRows: 1 },
      { affectedRows: 1 }
    );

    const res = await request(app)
      .delete("/api/admin/users/user@example.com")
      .set(auth(adminToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/notifications returns notifications", async () => {
    mockDbResponses([
      {
        id: 1,
        title: "Notification",
        is_read: 0,
      },
    ]);

    const res = await request(app)
      .get("/api/notifications")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("GET /api/notifications/unread-count returns unread count", async () => {
    mockDbResponses([{ unreadCount: 4 }]);

    const res = await request(app)
      .get("/api/notifications/unread-count")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.unreadCount).toBe(4);
  });

  test("POST /api/notifications/:id/read marks notification read", async () => {
    mockDbResponses({ affectedRows: 1 });

    const res = await request(app)
      .post("/api/notifications/1/read")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/notifications/read-all marks all notifications read", async () => {
    mockDbResponses({ affectedRows: 3 });

    const res = await request(app)
      .post("/api/notifications/read-all")
      .set(auth(educatorToken));

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});