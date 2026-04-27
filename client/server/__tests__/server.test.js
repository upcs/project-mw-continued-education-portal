const request = require("supertest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const token = jwt.sign(
  { email: "john@example.com", role: "admin" },
  process.env.JWT_SECRET || "test-secret"
);

describe("Backend API tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/health returns API status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "API is running" });
  });

  test("POST /api/auth/login succeeds with correct password", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    dbms.dbquery.mockImplementation((query, params, callback) => {
      callback(null, [
        {
          id: 1,
          email: "john@example.com",
          password: hashedPassword,
          fullname: "John Doe",
          role: "educator",
          approval_status: "approved",
        },
      ]);
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
  });

  test("GET /api/profile/me returns profile", async () => {
    dbms.dbquery.mockImplementation((query, params, callback) => {
      callback(null, [
        {
          fullname: "John Doe",
          email: "john@example.com",
          role: "educator",
        },
      ]);
    });

    const res = await request(app)
      .get("/api/profile/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("john@example.com");
  });

  test("POST /api/profile/update updates profile", async () => {
    dbms.dbquery.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .post("/api/profile/update")
      .set("Authorization", `Bearer ${token}`)
      .send({
        photo: "http://localhost:5000/uploads/john.jpg",
        fullname: "John Doe",
        whatsapp: "123456789",
        specialization: "CS",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/change-password succeeds", async () => {
    const hashedOldPassword = await bcrypt.hash("old123", 10);

    dbms.dbquery
      .mockImplementationOnce((query, params, callback) => {
        callback(null, [
          {
            email: "john@example.com",
            password: hashedOldPassword,
          },
        ]);
      })
      .mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

    const res = await request(app)
      .post("/api/profile/change-password")
      .set("Authorization", `Bearer ${token}`)
      .send({
        oldPassword: "old123",
        newPassword: "new123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/upload-photo succeeds", async () => {
    dbms.dbquery.mockImplementation((query, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .post("/api/profile/upload-photo")
      .set("Authorization", `Bearer ${token}`)
      .attach("photo", Buffer.from("fake image"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.photoUrl).toContain("/uploads/");
  });
});

