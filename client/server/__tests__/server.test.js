const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

describe("Backend API tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("GET /api/health returns API status", async () => {
    const res = await request(app).get("/api/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "API is running" });
  });

  test("GET /api/db-test returns success", async () => {
    dbms.dbquery.mockImplementation((query, callback) => {
      callback(null, [{ test: 1 }]);
    });

    const res = await request(app).get("/api/db-test");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile returns profile", async () => {
    dbms.dbquery.mockImplementation((query, callback) => {
      callback(null, [
        {
          fullname: "John Doe",
          email: "john@example.com",
          role: "Student",
        },
      ]);
    });

    const res = await request(app)
      .post("/api/profile")
      .send({ email: "john@example.com" });

    expect(res.statusCode).toBe(200);
    expect(res.body[0].email).toBe("john@example.com");
  });

  test("POST /api/profile/update updates profile", async () => {
    dbms.dbquery.mockImplementation((query, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .post("/api/profile/update")
      .send({
        email: "john@example.com",
        photo: "http://localhost:5000/uploads/john.jpg",
        fullname: "John Doe",
        role: "Student",
        whatsapp: "123456789",
        organization: "UP",
        specialization: "CS",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/auth/login succeeds with correct password", async () => {
    const hashedPassword = await bcrypt.hash("123456", 10);

    dbms.dbquery.mockImplementation((query, callback) => {
      callback(null, [{ email: "john@example.com", password: hashedPassword }]);
    });

    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: "john@example.com",
        password: "123456",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/change-password succeeds", async () => {
    const hashedOldPassword = await bcrypt.hash("old123", 10);

    dbms.dbquery
      .mockImplementationOnce((query, callback) => {
        callback(null, [{ email: "john@example.com", password: hashedOldPassword }]);
      })
      .mockImplementationOnce((query, callback) => {
        callback(null, { affectedRows: 1 });
      });

    const res = await request(app)
      .post("/api/profile/change-password")
      .send({
        email: "john@example.com",
        oldPassword: "old123",
        newPassword: "new123",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("POST /api/profile/upload-photo succeeds", async () => {
    const res = await request(app)
      .post("/api/profile/upload-photo")
      .attach("photo", Buffer.from("fake image"), "avatar.png");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.photoUrl).toContain("/uploads/");
  });
});