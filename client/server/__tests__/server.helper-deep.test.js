process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../dbms.js", () => ({
  dbquery: jest.fn(),
}));

const dbms = require("../dbms.js");
const app = require("../server");

const {
  normalizeResourceUrl,
  getEmbedUrl,
  detectUploadedFileType,
  normalizeQuizText,
  canManageModuleQuiz,
  extractYouTubeId,
} = app.__testHelpers;

const trainerToken = jwt.sign(
  { id: 1, email: "trainer@example.com", role: "trainer" },
  process.env.JWT_SECRET
);

const adminToken = jwt.sign(
  { id: 2, email: "admin@example.com", role: "admin" },
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
    const response = index < responses.length ? responses[index++] : [];

    if (response instanceof Error) return cb(response);
    return cb(null, response);
  });
}

describe("Deep helper coverage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("normalizeResourceUrl accepts http URL", () => {
    expect(normalizeResourceUrl("http://example.com/test")).toBe(
      "http://example.com/test"
    );
  });

  test("normalizeResourceUrl accepts https URL and trims spaces", () => {
    expect(normalizeResourceUrl("  https://example.com/test  ")).toBe(
      "https://example.com/test"
    );
  });

  test("normalizeResourceUrl rejects ftp protocol", () => {
    expect(normalizeResourceUrl("ftp://example.com/file")).toBeNull();
  });

  test("normalizeResourceUrl returns null for invalid URL", () => {
    expect(normalizeResourceUrl("::::bad-url::::")).toBeNull();
  });

  test("getEmbedUrl handles youtube watch URL", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  test("getEmbedUrl handles youtu.be URL", () => {
    expect(getEmbedUrl("https://youtu.be/abc123")).toBe(
      "https://www.youtube.com/embed/abc123"
    );
  });

  test("getEmbedUrl handles youtube URL without video id", () => {
    expect(getEmbedUrl("https://www.youtube.com/watch")).toBeNull();
  });

  test("getEmbedUrl handles google drive file URL", () => {
    expect(
      getEmbedUrl("https://drive.google.com/file/d/file123/view")
    ).toBe("https://drive.google.com/file/d/file123/preview");
  });

  test("getEmbedUrl handles google drive URL without file id", () => {
    expect(getEmbedUrl("https://drive.google.com/drive/folders/abc")).toBeNull();
  });

  test("getEmbedUrl handles vimeo URL", () => {
    expect(getEmbedUrl("https://vimeo.com/12345")).toBe(
      "https://player.vimeo.com/video/12345"
    );
  });

  test("getEmbedUrl handles vimeo URL without id", () => {
    expect(getEmbedUrl("https://vimeo.com/")).toBeNull();
  });

  test("getEmbedUrl returns null for normal website", () => {
    expect(getEmbedUrl("https://example.com/resource")).toBeNull();
  });

  test("getEmbedUrl returns null for invalid URL", () => {
    expect(getEmbedUrl("not a url")).toBeNull();
  });

  test("extractYouTubeId extracts watch id", () => {
    expect(extractYouTubeId("https://youtube.com/watch?v=abc123")).toBe("abc123");
  });

  test("extractYouTubeId extracts youtu.be id", () => {
    expect(extractYouTubeId("https://youtu.be/short123")).toBe("short123");
  });

  test("extractYouTubeId extracts shorts id", () => {
    expect(extractYouTubeId("https://youtube.com/shorts/shorts123")).toBe(
      "shorts123"
    );
  });

  test("extractYouTubeId returns empty string when missing", () => {
    expect(extractYouTubeId("https://example.com")).toBe("");
  });

  test("canManageModuleQuiz allows admin", () => {
    expect(
      canManageModuleQuiz(
        { created_by_email: "someone@example.com" },
        { email: "admin@example.com", role: "admin" }
      )
    ).toBe(true);
  });

  test("canManageModuleQuiz allows owning trainer", () => {
    expect(
      canManageModuleQuiz(
        { created_by_email: "trainer@example.com" },
        { email: "trainer@example.com", role: "trainer" }
      )
    ).toBe(true);
  });

  test("canManageModuleQuiz rejects other trainer", () => {
    expect(
      canManageModuleQuiz(
        { created_by_email: "trainer@example.com" },
        { email: "other@example.com", role: "trainer" }
      )
    ).toBe(false);
  });

  test("canManageModuleQuiz rejects educator", () => {
    expect(
      canManageModuleQuiz(
        { created_by_email: "educator@example.com" },
        { email: "educator@example.com", role: "educator" }
      )
    ).toBe(false);
  });

  test("normalizeQuizText handles null", () => {
    expect(normalizeQuizText(null)).toBe("");
  });

  test("detectUploadedFileType handles uppercase extension", () => {
    expect(
      detectUploadedFileType({
        originalname: "FILE.PDF",
        mimetype: "",
      })
    ).toBe("application/pdf");
  });
});

describe("Extra route branches for 70 percent push", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("course upload rejects both file and url", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "Bad Upload")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com")
      .attach("courseFile", Buffer.from("file"), "course.pdf");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module create rejects both file and url", async () => {
    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "Bad Module")
      .field("type", "lesson")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com")
      .attach("moduleFile", Buffer.from("file"), "module.pdf");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("module create file branch succeeds", async () => {
    mockDbResponses(
      [{ id: 1 }],
      [{ nextPosition: 1 }],
      { insertId: 9 },
      [{ lessons: 1, quizzes: 0 }],
      { affectedRows: 1 }
    );

    const res = await request(app)
      .post("/api/courses/1/modules")
      .set(auth(trainerToken))
      .field("title", "File Module")
      .field("type", "lesson")
      .field("resourceType", "file")
      .attach("moduleFile", Buffer.from("file"), "module.txt");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_type).toContain("text");
  });

  test("module upload file branch succeeds", async () => {
    mockDbResponses([{ id: 1 }], { affectedRows: 1 });

    const res = await request(app)
      .post("/api/modules/1/upload")
      .set(auth(trainerToken))
      .field("content", "File content")
      .field("resourceType", "file")
      .attach("moduleFile", Buffer.from("file"), "module.pdf");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.file_type).toContain("pdf");
  });

  test("course upload youtu.be URL produces embed URL", async () => {
    mockDbResponses({ insertId: 88 });

    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "Short YouTube")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "https://youtu.be/abc123");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.embed_url).toBe("https://www.youtube.com/embed/abc123");
  });

  test("course upload ftp URL is rejected", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(trainerToken))
      .field("title", "FTP")
      .field("instructor", "Trainer")
      .field("resourceType", "url")
      .field("resourceUrl", "ftp://example.com/file");

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("trainer route rejects educator with 403", async () => {
    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(educatorToken))
      .field("title", "Forbidden")
      .field("instructor", "Trainer");

    expect(res.statusCode).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("admin can access trainer-authorized route", async () => {
    mockDbResponses({ insertId: 99 });

    const res = await request(app)
      .post("/api/courses/upload")
      .set(auth(adminToken))
      .field("title", "Admin Course")
      .field("instructor", "Admin")
      .field("resourceType", "url")
      .field("resourceUrl", "https://example.com");

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});