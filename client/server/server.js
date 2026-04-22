const path = require("path");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbms = require("./dbms.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const https = require("https");
const fs = require("fs");
//import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
//const PORT = 5000;

const JWT_SECRET = process.env.JWT_SECRET;
const APP_BASE_URL = `https://cs341s26mwed.campus.up.edu:${PORT}`;
//const APP_BASE_URL = process.env.APP_BASE_URL || `http://localhost:${PORT}`;

if (!JWT_SECRET){
    throw new Error("Missing JWT_SECRET in environment variables.");
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || "educator",
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.user.role === "admin") {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }

    next();
  };
}

function normalizeResourceUrl(input) {
  try {
    const url = new URL(String(input).trim());

    if (!["http:", "https:"].includes(url.protocol)) {
      return null;
    }

    return url.toString();
  } catch (error) {
    return null;
  }
}

function getEmbedUrl(resourceUrl) {
  try {
    const url = new URL(resourceUrl);
    const host = url.hostname.replace(/^www\./, "");

    //YouTube
    if (host === "youtube.com" || host === "youtu.be"){
      let videoId = "";

      if (host === "youtu.be") {
        videoId = url.pathname.replace("/", "");

      } else {
        videoId = url.searchParams.get("v") || "";
      }

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    //Google Drive File
    if (host === 'drive.google.com') {
      const match = url.pathname.match(/\/file\/d\/([^/]+)/);
      if(match?.[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }

    //Vimeo
    if(host === "vimeo.com") {
      const videoId = url.pathname.replace("/", "");
      if (videoId){
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }

    return null;
  } catch (error){
    return null;
  }
}

function recalculateCourseCounts(courseId, callback) {
  const query = `
    SELECT
      SUM(CASE WHEN type <> 'quiz' THEN 1 ELSE 0 END) AS lessons,
      SUM(CASE WHEN type = 'quiz' THEN 1 ELSE 0 END) AS quizzes
    FROM course_modules
    WHERE course_id = ?
  `;

  dbms.dbquery(query, [courseId], (err, results) => {
    if (err) {
      return callback(err);
    }

    const lessons = Number(results?.[0]?.lessons || 0);
    const quizzes = Number(results?.[0]?.quizzes || 0);

    const updateQuery = `
      UPDATE courses
      SET lessons = ?, quizzes = ?
      WHERE id = ?
    `;

    dbms.dbquery(updateQuery, [lessons, quizzes, courseId], (updateErr) => {
      if (updateErr) {
        return callback(updateErr);
      }

      callback(null, { lessons, quizzes });
    });
  });
}

function detectUploadedFileType(file) {
  if (!file) return "";

  const originalName = String(file.originalname || "").toLowerCase();
  const mimetype = String(file.mimetype || "").toLowerCase();

  if (mimetype) {
    return mimetype;
  }

  if (originalName.endsWith(".pdf")) {
    return "application/pdf";
  }

  if (
    originalName.endsWith(".txt") ||
    originalName.endsWith(".md")
  ) {
    return "text/plain";
  }

  if (originalName.endsWith(".docx")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }

  if (originalName.endsWith(".doc")) {
    return "application/msword";
  }

  return "";
}


app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const upload = multer({ storage });

function extractYouTubeId(url = "") {
  const match =
    url.match(/[?&]v=([^&]+)/) ||
    url.match(/youtu\.be\/([^?&]+)/) ||
    url.match(/\/shorts\/([^?&]+)/);
  return match ? match[1] : "";
}

function getUserWithProfileByEmail(email, callback) {

  const normalizedEmail = String(email).trim().toLocaleLowerCase();
  const query = `
    SELECT
      u.id,
      u.email,
      u.password,
      COALESCE(p.fullname, '') AS fullname,
      COALESCE(p.role, 'educator') AS role,
      COALESCE(o.name, '') AS organization,
      p.organization_id,
      COALESCE(p.photo, '') AS photo,
      COALESCE(p.whatsapp, '') AS whatsapp,
      COALESCE(p.specialization, '') AS specialization
    FROM users u
    LEFT JOIN profile p ON p.email = u.email
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE u.email = ?
    LIMIT 1
  `;

  dbms.dbquery(query, [normalizedEmail], callback);
}

function createNotification({
  recipientEmail,
  actorEmail = null,
  type,
  title,
  message,
  link = null,
}, callback) {
  const normalizedRecipient = String(recipientEmail).trim().toLowerCase();
  const normalizedActor = actorEmail ? String(actorEmail).trim().toLowerCase() : null;

  const query = `
    INSERT INTO notifications (
      recipient_email,
      actor_email,
      type,
      title,
      message,
      link
    )
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  dbms.dbquery(
    query,
    [normalizedRecipient, normalizedActor, type, title, message, link],
    callback
  );
}


app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  getUserWithProfileByEmail(email, async (err, response) => {
    if (err) {
      console.error("LOGIN ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Server error during login",
      });
    }
    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = response[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullname: user.fullname || "",
      role: user.role || "educator",
      organization: user.organization || "",
      organization_id: user.organization_id || null,
      photo: user.photo || "",
      whatsapp: user.whatsapp || "",
      specialization: user.specialization || "",
    };

    const token = createToken(safeUser);

    return res.json({
      success: true,
      token,
      user: safeUser,
    });
  });
});


app.get("/api/auth/me", authenticateToken, (req, res) => {
  getUserWithProfileByEmail(req.user.email, (err, response) => {
    if (err) {
      console.error("AUTH ME ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load current user",
      });
    }

    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = response[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullname: user.fullname || "",
        role: user.role || "educator",
        organization: user.organization || "",
        organization_id: user.organization_id || null,
        photo: user.photo || "",
        whatsapp: user.whatsapp || "",
        specialization: user.specialization || "",
      },
    });
  });
});


app.post("/api/profile/change-password", authenticateToken, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  dbms.dbquery(query, [req.user.email], async (err, response) => {
    if (err) {
      console.error("CHANGE PASSWORD ERROR:", err);
      return res.status(500).json({ success: false });
    }

    if (!response || response.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = response[0];
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    const updateQuery = `UPDATE users SET password = ? WHERE email = ?`;

    dbms.dbquery(updateQuery, [hashedNewPassword, req.user.email], (err2) => {
      if (err2) {
        console.error("CHANGE PASSWORD UPDATE ERROR:", err2);
        return res.status(500).json({ success: false });
      }

      return res.json({
        success: true,
        message: "Password updated successfully",
      });
    });
  });
});


app.post("/api/auth/signup", async (req, res) => {
  try {
    const { fullname, email, password, role } = req.body;

    if (!fullname || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedRole = role || "educator";

    const allowedRoles = ["admin", "trainer", "educator", "principal"];
    if (!allowedRoles.includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role selected",
      });
    }

    dbms.dbquery(
      "SELECT email FROM users WHERE email = ?",
      [normalizedEmail],
      async (checkErr, existingUsers) => {
        if (checkErr) {
          console.error("SIGNUP CHECK ERROR:", checkErr);
          return res.status(500).json({
            success: false,
            message: "Database error while checking user",
          });
        }

        if (existingUsers && existingUsers.length > 0) {
          return res.status(409).json({
            success: false,
            message: "An account with this email already exists",
          });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        dbms.dbquery(
          "INSERT INTO users (email, password) VALUES (?, ?)",
          [normalizedEmail, hashedPassword],
          (userErr) => {
            if (userErr) {
              console.error("SIGNUP USER INSERT ERROR:", userErr);
              return res.status(500).json({
                success: false,
                message: "Failed to create user account",
              });
            }

            dbms.dbquery(
              "INSERT INTO profile (email, fullname, role) VALUES (?, ?, ?)",
              [normalizedEmail, fullname, normalizedRole],
              (profileErr) => {
                if (profileErr) {
                  console.error("SIGNUP PROFILE INSERT ERROR:", profileErr);
                  return res.status(500).json({
                    success: false,
                    message: "User created, but profile creation failed",
                  });
                }

                return res.status(201).json({
                  success: true,
                  message: "Signup successful",
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error("SIGNUP ROUTE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during signup",
    });
  }
});


app.post( "/api/courses/upload",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "courseFile", maxCount: 1 },
  ]),
  (req, res) => {
    const {
      title,
      instructor,
      lessons,
      quizzes,
      progress,
      description,
      resourceType,
      resourceUrl,
    } = req.body;

    if (!title || !instructor) {
      return res.status(400).json({
        success: false,
        message: "Title and instructor are required",
      });
    }

    const normalizedResourceType = String(resourceType || "file")
      .trim()
      .toLowerCase();

    if (!["file", "url"].includes(normalizedResourceType)) {
      return res.status(400).json({
        success: false,
        message: "Resource type must be either 'file' or 'url'",
      });
    }

    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const courseFile = req.files?.courseFile?.[0] || null;

    const thumbnailUrl = thumbnailFile
      ? `${APP_BASE_URL}/uploads/${thumbnailFile.filename}`
      : "";

    let fileUrl = null;
    let fileType = null;
    let normalizedUrl = null;
    let embedUrl = null;

    if (normalizedResourceType === "file") {
      if (!courseFile) {
        return res.status(400).json({
          success: false,
          message: "A course file is required when resource type is 'file'",
        });
      }

      fileUrl = `${APP_BASE_URL}/uploads/${courseFile.filename}`;

      fileType = detectUploadedFileType(courseFileFile);
    }

    if (normalizedResourceType === "url") {
      if (courseFile) {
        return res.status(400).json({
          success: false,
          message: "Provide either a course file or a resource URL, not both",
        });
      }

      normalizedUrl = normalizeResourceUrl(resourceUrl);

      if (!normalizedUrl) {
        return res.status(400).json({
          success: false,
          message: "A valid http/https resource URL is required",
        });
      }

      embedUrl = getEmbedUrl(normalizedUrl);
    }

    const query = `
      INSERT INTO courses (
        title,
        instructor,
        lessons,
        quizzes,
        progress,
        description,
        thumbnail,
        file_url,
        file_type,
        uploaded_by_email,
        resource_type,
        resource_url,
        embed_url
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      title,
      instructor,
      Number(lessons) || 0,
      Number(quizzes) || 0,
      Number(progress) || 0,
      description || "",
      thumbnailUrl,
      fileUrl,
      fileType,
      req.user.email,
      normalizedResourceType,
      normalizedUrl,
      embedUrl,
    ];

    dbms.dbquery(query, values, (err, response) => {
      if (err) {
        console.error("COURSE UPLOAD ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to upload course",
          error: err.sqlMessage || err.message || String(err),
        });
      }

      return res.json({
        success: true,
        message: "Course uploaded successfully",
        courseId: response.insertId,
        data: {
          id: response.insertId,
          title,
          instructor,
          lessons: Number(lessons) || 0,
          quizzes: Number(quizzes) || 0,
          progress: Number(progress) || 0,
          description: description || "",
          thumbnail: thumbnailUrl,
          file_url: fileUrl,
          file_type: fileType,
          resource_type: normalizedResourceType,
          resource_url: normalizedUrl,
          embed_url: embedUrl,
        },
      });
    });
  }
);

app.get("/api/courses/:id/modules", (req, res) => {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid course id is required",
    });
  }

  const query = `
    SELECT
      id,
      course_id,
      title,
      type,
      content,
      file_url,
      file_type,
      resource_type,
      resource_url,
      embed_url,
      position
    FROM course_modules
    WHERE course_id = ?
    ORDER BY position ASC, id ASC
  `;

  dbms.dbquery(query, [courseId], (err, response) => {
    if (err) {
      console.error("GET MODULES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch course modules",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});


app.get("/api/courses", (req, res) => {
  const query = `
    SELECT
      id,
      title,
      instructor,
      lessons,
      quizzes,
      progress,
      thumbnail,
      description,
      file_url,
      file_type,
      resource_type,
      resource_url,
      embed_url,
      uploaded_by_email
    FROM courses
    ORDER BY id DESC
  `;

  dbms.dbquery(query, (err, response) => {
    if (err) {
      console.error("ALL COURSES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch courses",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.get("/api/courses/enrolled", authenticateToken, (req, res) => {
  const { role, email } = req.user;
  const asTrainer = req.query.asTrainer === "true";
  const trainerEmail = req.query.trainerEmail;

  if (role === "educator") {
    const query = `
      SELECT
        c.id,
        c.title,
        c.instructor,
        c.lessons,
        c.quizzes,
        COALESCE(eca.progress, 0) AS progress,
        c.thumbnail,
        c.description,
        eca.status AS assignment_status,
        eca.source,
        eca.assigned_at
      FROM educator_course_assignments eca
      LEFT JOIN courses c ON c.id = eca.course_id
      WHERE eca.educator_email = ?
      ORDER BY eca.assigned_at DESC
    `;

    dbms.dbquery(query, [email], (err, response) => {
      if (err) {
        console.error("EDUCATOR COURSES ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch educator courses",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });

    return;
  }

  if (role === "trainer" || (role === "admin" && asTrainer)) {
    const effectiveEmail =
      role === "trainer"
        ? email
        : trainerEmail || email;

    const query = `
      SELECT DISTINCT
        c.id,
        c.title,
        c.instructor,
        c.lessons,
        c.quizzes,
        c.progress,
        c.thumbnail,
        c.description,
        c.file_url,
        c.file_type,
        c.uploaded_by_email,
        CASE
          WHEN c.uploaded_by_email = ? THEN 'Uploaded Course'
          WHEN EXISTS (
            SELECT 1
            FROM course_modules cm_quiz
            WHERE cm_quiz.course_id = c.id
              AND cm_quiz.created_by_email = ?
              AND cm_quiz.type = 'quiz'  
          ) THEN 'Added Quiz'
          WHEN EXISTS (
            SELECT 1
            FROM course_modules cm_module
            WHERE cm_module.course_id = c.id
              AND cm_module.created_by_email = ?
              AND cm_module.type <> 'quiz'  
          ) THEN 'Added Module'
          ELSE 'Contributed'
        END AS contributed_type
      FROM courses c
      LEFT JOIN course_modules cm ON cm.course_id = c.id
      WHERE c.uploaded_by_email = ?
         OR cm.created_by_email = ?
      ORDER BY c.id DESC
    `;

    dbms.dbquery(query, [effectiveEmail, effectiveEmail, effectiveEmail, effectiveEmail, effectiveEmail], (err, response) => {
      if (err) {
        console.error("TRAINER CONTRIBUTED COURSES ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch trainer courses",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });

    return;
  }

  const query = `
    SELECT
      id,
      title,
      instructor,
      lessons,
      quizzes,
      progress,
      thumbnail,
      description,
      file_url,
      file_type
    FROM courses
    ORDER BY id DESC
  `;

  dbms.dbquery(query, [], (err, response) => {
    if (err) {
      console.error("ALL COURSES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch courses",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.post( "/api/courses/:courseId/enroll",
  authenticateToken,
  authorizeRoles("educator", "trainer", "principal", "admin"),
  (req, res) => {
    const { courseId } = req.params;

    const profileQuery = `
      SELECT organization_id
      FROM profile
      WHERE email = ?
      LIMIT 1
    `;

    dbms.dbquery(profileQuery, [req.user.email], (profileErr, profileRes) => {
      if (profileErr) {
        console.error("SELF ENROLL PROFILE ERROR:", profileErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate educator profile",
        });
      }

      if (!profileRes || profileRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Educator profile not found",
        });
      }

      const organizationId = profileRes[0].organization_id;
      if(!organizationId){
        return res.status(400).json({
          success: false,
          message: "You must be assigned to an organization before enrolling in a course",
        });
      }

      const courseQuery = `
        SELECT id
        FROM courses
        WHERE id = ?
        LIMIT 1
      `;

      dbms.dbquery(courseQuery, [courseId], (courseErr, courseRes) => {
        if (courseErr) {
          console.error("SELF ENROLL COURSE ERROR:", courseErr);
          return res.status(500).json({
            success: false,
            message: "Failed to validate course",
          });
        }

        if (!courseRes || courseRes.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        const insertQuery = `
          INSERT INTO educator_course_assignments (
            educator_email,
            course_id,
            assigned_by_email,
            organization_id,
            status,
            source
          )
          VALUES (?, ?, ?, ?, 'in_progress', 'self')
        `;

        dbms.dbquery(
          insertQuery,
          [req.user.email, courseId, req.user.email, organizationId],
          (insertErr) => {
            if (insertErr) {
              console.error("SELF ENROLL INSERT ERROR:", insertErr);

              if (insertErr.code === "ER_DUP_ENTRY") {
                return res.status(400).json({
                  success: false,
                  message: "You are already enrolled in this course",
                });
              }

              return res.status(500).json({
                success: false,
                message: "Failed to enroll in course",
              });
            }

            return res.json({
              success: true,
              message: "Successfully enrolled in course",
            });
          }
        );
      });
    });
  }
);

app.get("/api/courses/:id", (req, res) => {
  const courseId = Number(req.params.id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid course id is required",
    });
  }

  const courseQuery = `
    SELECT
      id,
      title,
      instructor,
      progress,
      thumbnail,
      description,
      lessons,
      quizzes,
      file_url,
      file_type,
      resource_type,
      resource_url,
      embed_url,
      uploaded_by_email
    FROM courses
    WHERE id = ?
    LIMIT 1
  `;

  dbms.dbquery(courseQuery, [courseId], (err, courseResponse) => {
    if (err) {
      console.error("COURSE DETAILS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch course details",
      });
    }

    if (!courseResponse || courseResponse.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const course = courseResponse[0];

    const modulesQuery = `
      SELECT
        id,
        course_id,
        title,
        type,
        content,
        file_url,
        file_type,
        resource_type,
        resource_url,
        embed_url,
        position,
        created_by_email
      FROM course_modules
      WHERE course_id = ?
      ORDER BY position ASC, id ASC
    `;

    dbms.dbquery(modulesQuery, [courseId], (modulesErr, modulesResponse) => {
      if (modulesErr) {
        console.error("COURSE MODULES ERROR:", modulesErr);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch course modules",
        });
      }

      return res.json({
        success: true,
        data: {
          ...course,
          modules: modulesResponse || [],
        },
      });
    });
  });
});

app.post( "/api/courses/:courseId/start",
  authenticateToken,
  authorizeRoles("educator"),
  (req, res) => {
    const { courseId } = req.params;

    const query = `
      UPDATE educator_course_assignments
      SET status = 'in_progress'
      WHERE educator_email = ?
        AND course_id = ?
        AND status = 'assigned'
    `;

    dbms.dbquery(query, [req.user.email, courseId], (err) => {
      if (err) {
        console.error("COURSE START ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update course status",
        });
      }

      return res.json({
        success: true,
        message: "Course marked as in progress",
      });
    });
  }
);

app.post("/api/courses/:courseId/check-completion",
  authenticateToken,
  authorizeRoles("educator"),
  (req, res) => {
    const { courseId } = req.params;

    const totalQuizzesQuery = `
      SELECT COUNT(*) AS totalQuizzes
      FROM course_modules
      WHERE course_id = ? AND type = 'quiz'
    `;

    const passedQuizzesQuery = `
      SELECT COUNT(DISTINCT qs.module_id) AS passedQuizzes
      FROM quiz_submissions qs
      INNER JOIN course_modules cm ON cm.id = qs.module_id
      WHERE qs.user_email = ?
        AND qs.is_latest = 1
        AND cm.course_id = ?
        AND cm.type = 'quiz'
        AND qs.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
        AND CAST(qs.grade AS DECIMAL(10,2)) >= 50
    `;

    dbms.dbquery(totalQuizzesQuery, [courseId], (totalErr, totalRes) => {
      if (totalErr) {
        console.error("CHECK COMPLETION TOTAL QUIZZES ERROR:", totalErr);
        return res.status(500).json({
          success: false,
          message: "Failed to check completion",
        });
      }

      dbms.dbquery(
        passedQuizzesQuery,
        [req.user.email, courseId],
        (passedErr, passedRes) => {
          if (passedErr) {
            console.error("CHECK COMPLETION PASSED QUIZZES ERROR:", passedErr);
            return res.status(500).json({
              success: false,
              message: "Failed to check completion",
            });
          }

          const totalQuizzes = Number(totalRes?.[0]?.totalQuizzes || 0);
          const passedQuizzes = Number(passedRes?.[0]?.passedQuizzes || 0);

          const progress =
            totalQuizzes > 0
              ? Math.round((passedQuizzes / totalQuizzes) * 100)
              : 0;

          const isCompleted =
            totalQuizzes > 0 && passedQuizzes >= totalQuizzes;

          const updateQuery = `
            UPDATE educator_course_assignments
            SET
              progress = ?,
              status = ?
            WHERE educator_email = ?
              AND course_id = ?
          `;

          dbms.dbquery(
            updateQuery,
            [
              progress,
              isCompleted ? "completed" : "in_progress",
              req.user.email,
              courseId,
            ],
            (updateErr) => {
              if (updateErr) {
                console.error("CHECK COMPLETION UPDATE ERROR:", updateErr);
                return res.status(500).json({
                  success: false,
                  message: "Failed to update completion status",
                });
              }

              return res.json({
                success: true,
                data: {
                  completed: isCompleted,
                  totalQuizzes,
                  passedQuizzes,
                  progress,
                },
                message: isCompleted
                  ? "Course marked as completed"
                  : "Course progress updated",
              });
            }
          );
        }
      );
    });
  }
);

app.get("/api/courses/:courseId/submissions",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  (req, res) => {
    const { courseId } = req.params;

    const query = `
      SELECT
        qs.id,
        qs.module_id,
        qs.course_id,
        qs.user_email,
        qs.answer_text,
        qs.file_url,
        qs.file_type,
        qs.status,
        qs.grade,
        qs.feedback,
        qs.reviewed_by_email,
        qs.reviewed_at,
        qs.created_at,
        cm.title AS module_title,
        c.title AS course_title
      FROM quiz_submissions qs
      LEFT JOIN course_modules cm ON qs.module_id = cm.id
      LEFT JOIN courses c ON qs.course_id = c.id
      WHERE qs.course_id = ?
      ORDER BY qs.created_at DESC
    `;

    dbms.dbquery(query, [courseId], (err, response) => {
      if (err) {
        console.error("COURSE SUBMISSIONS ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch course submissions",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });
  }
);

app.put( "/api/submissions/:submissionId/grade",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  (req, res) => {
    const submissionId = Number(req.params.submissionId);
    const { status, grade, feedback } = req.body;
    const reviewerEmail = String(req.user.email).trim().toLowerCase();

    const allowedStatuses = ["submitted", "approved", "rejected"];

    if (!Number.isInteger(submissionId) || submissionId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid submission id is required",
      });
    }

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const submissionLookupQuery = `
      SELECT
        qs.id,
        qs.user_email,
        qs.course_id,
        qs.module_id,
        cm.title AS moduleTitle,
        c.title AS courseTitle
      FROM quiz_submissions qs
      LEFT JOIN course_modules cm ON qs.module_id = cm.id
      LEFT JOIN courses c ON qs.course_id = c.id
      WHERE qs.id = ?
      LIMIT 1
    `;

    dbms.dbquery(submissionLookupQuery, [submissionId], (lookupErr, lookupRes) => {
      if (lookupErr) {
        console.error("SUBMISSION LOOKUP ERROR:", lookupErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load submission",
        });
      }

      if (!lookupRes || lookupRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      const submission = lookupRes[0];

      const updateQuery = `
        UPDATE quiz_submissions
        SET
          status = ?,
          grade = ?,
          feedback = ?,
          reviewed_by_email = ?,
          reviewed_at = NOW()
        WHERE id = ?
      `;

      dbms.dbquery(
        updateQuery,
        [status, grade || "", feedback || "", reviewerEmail, submissionId],
        (err, response) => {
          if (err) {
            console.error("GRADE SUBMISSION ERROR:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to grade submission",
            });
          }

          if (!response || response.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Submission not found",
            });
          }

          createNotification(
            {
              recipientEmail: submission.user_email,
              actorEmail: reviewerEmail,
              type: "submission_reviewed",
              title: "Your quiz submission was reviewed",
              message: `Your submission for "${submission.moduleTitle || "quiz"}" in "${submission.courseTitle || "course"}" was ${status}.`,
              link: `/my-submissions`,
            },
            (notificationErr) => {
              if (notificationErr) {
                console.error("CREATE SUBMISSION REVIEW NOTIFICATION ERROR:", notificationErr);
              }

              return res.json({
                success: true,
                message: "Submission graded successfully",
              });
            }
          );
        }
      );
    });
  }
);

app.post( "/api/courses/:id/modules",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  upload.single("moduleFile"),
  (req, res) => {
    const courseId = Number(req.params.id);
    const title = String(req.body?.title || "").trim();
    const type = String(req.body?.type || "").trim();
    const content = String(req.body?.content || "");
    const resourceType = String(req.body?.resourceType || "file")
      .trim()
      .toLowerCase();
    const resourceUrl = String(req.body?.resourceUrl || "").trim();

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid course id is required",
      });
    }

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: "Title and type are required",
      });
    }

    if (!["file", "url"].includes(resourceType)) {
      return res.status(400).json({
        success: false,
        message: "Resource type must be either 'file' or 'url'",
      });
    }

    const uploadedFile = req.file || null;

    let fileUrl = null;
    let fileType = null;
    let normalizedUrl = null;
    let embedUrl = null;

    if (resourceType === "file") {
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "A module file is required when resource type is 'file'",
        });
      }

      fileUrl = `${APP_BASE_URL}/uploads/${uploadedFile.filename}`;

      fileType = uploadedFile.mimetype
        ? uploadedFile.mimetype
        : uploadedFile.originalname.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : uploadedFile.originalname.toLowerCase().endsWith(".txt") ||
          uploadedFile.originalname.toLowerCase().endsWith(".md")
        ? "text/plain"
        : "";
    }

    if (resourceType === "url") {
      if (uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Provide either a module file or a resource URL, not both",
        });
      }

      normalizedUrl = normalizeResourceUrl(resourceUrl);

      if (!normalizedUrl) {
        return res.status(400).json({
          success: false,
          message: "A valid http/https resource URL is required",
        });
      }

      embedUrl = getEmbedUrl(normalizedUrl);
    }

    const courseCheckQuery = `
      SELECT id
      FROM courses
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(courseCheckQuery, [courseId], (courseErr, courseRes) => {
      if (courseErr) {
        console.error("COURSE CHECK ERROR:", courseErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate course",
        });
      }

      if (!courseRes || courseRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const positionQuery = `
        SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition
        FROM course_modules
        WHERE course_id = ?
      `;

      dbms.dbquery(positionQuery, [courseId], (posErr, posRes) => {
        if (posErr) {
          console.error("POSITION ERROR:", posErr);
          return res.status(500).json({
            success: false,
            message: "Failed to determine module position",
          });
        }

        const nextPosition = posRes?.[0]?.nextPosition || 1;

        const insertQuery = `
          INSERT INTO course_modules (
            course_id,
            title,
            type,
            content,
            file_url,
            file_type,
            resource_type,
            resource_url,
            embed_url,
            position,
            created_by_email
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          courseId,
          title,
          type,
          content,
          fileUrl,
          fileType,
          resourceType,
          normalizedUrl,
          embedUrl,
          nextPosition,
          req.user.email,
        ];

        dbms.dbquery(insertQuery, values, (insertErr, response) => {
          if (insertErr) {
            console.error("ADD MODULE ERROR:", insertErr);
            return res.status(500).json({
              success: false,
              message: "Failed to add module",
            });
          }

          recalculateCourseCounts(courseId, (recalcErr, counts) => {
            if (recalcErr) {
              console.error("RECALCULATE COURSE COUNTS ERROR:", recalcErr);
              return res.status(500).json({
                success: false,
                message: "Module added, but failed to update course counts",
              });
            }

            return res.json({
              success: true,
              message: `${type === "quiz" ? "Quiz" : "Module"} added successfully`,
              data: {
                id: response.insertId,
                course_id: courseId,
                title,
                type,
                content,
                file_url: fileUrl,
                file_type: fileType,
                resource_type: resourceType,
                resource_url: normalizedUrl,
                embed_url: embedUrl,
                position: nextPosition,
              },
              counts,
            });
          });
        });
      });
    });
  }
);

app.post( "/api/modules/:moduleId/upload",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  upload.single("moduleFile"),
  (req, res) => {
    const moduleId = Number(req.params.moduleId);
    const content = String(req.body?.content || "");
    const resourceType = String(req.body?.resourceType || "file")
      .trim()
      .toLowerCase();
    const resourceUrl = String(req.body?.resourceUrl || "").trim();

    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid module id is required",
      });
    }

    if (!["file", "url"].includes(resourceType)) {
      return res.status(400).json({
        success: false,
        message: "Resource type must be either 'file' or 'url'",
      });
    }

    const uploadedFile = req.file || null;

    let fileUrl = null;
    let fileType = null;
    let normalizedUrl = null;
    let embedUrl = null;

    if (resourceType === "file") {
      if (!uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "A module file is required when resource type is 'file'",
        });
      }

      fileUrl = `${APP_BASE_URL}/uploads/${uploadedFile.filename}`;
      fileType = detectUploadedFileType(uploadedFile);
    }

    if (resourceType === "url") {
      if (uploadedFile) {
        return res.status(400).json({
          success: false,
          message: "Provide either a module file or a resource URL, not both",
        });
      }

      normalizedUrl = normalizeResourceUrl(resourceUrl);

      if (!normalizedUrl) {
        return res.status(400).json({
          success: false,
          message: "A valid http/https resource URL is required",
        });
      }

      embedUrl = getEmbedUrl(normalizedUrl);
    }

    const moduleCheckQuery = `
      SELECT id
      FROM course_modules
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(moduleCheckQuery, [moduleId], (checkErr, checkRes) => {
      if (checkErr) {
        console.error("MODULE CHECK ERROR:", checkErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate module",
        });
      }

      if (!checkRes || checkRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const query = `
        UPDATE course_modules
        SET
          content = ?,
          file_url = ?,
          file_type = ?,
          resource_type = ?,
          resource_url = ?,
          embed_url = ?
        WHERE id = ?
      `;

      dbms.dbquery(
        query,
        [
          content,
          fileUrl,
          fileType,
          resourceType,
          normalizedUrl,
          embedUrl,
          moduleId,
        ],
        (err) => {
          if (err) {
            console.error("MODULE UPLOAD ERROR:", err);
            return res.status(500).json({
              success: false,
              message: "Failed to update module resource",
            });
          }

          return res.json({
            success: true,
            message: "Module updated successfully",
            data: {
              id: moduleId,
              content,
              file_url: fileUrl,
              file_type: fileType,
              resource_type: resourceType,
              resource_url: normalizedUrl,
              embed_url: embedUrl,
            },
          });
        }
      );
    });
  }
);

app.get( "/api/modules/:moduleId/submissions",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  (req, res) => {
    const { moduleId } = req.params;

    const query = `
      SELECT
        qs.id,
        qs.module_id,
        qs.course_id,
        qs.user_email,
        qs.answer_text,
        qs.file_url,
        qs.file_type,
        qs.status,
        qs.grade,
        qs.feedback,
        qs.reviewed_by_email,
        qs.reviewed_at,
        qs.created_at
      FROM quiz_submissions qs
      WHERE qs.module_id = ?
      ORDER BY qs.created_at DESC
    `;

    dbms.dbquery(query, [moduleId], (err, response) => {
      if (err) {
        console.error("MODULE SUBMISSIONS ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch module submissions",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });
  }
);

app.post("/api/modules/:moduleId/submissions",
  authenticateToken,
  authorizeRoles("educator"),
  upload.single("submissionFile"),
  (req, res) => {
    const { moduleId } = req.params;
    const { answerText } = req.body;

    const uploadedFile = req.file || null;

    const fileUrl = uploadedFile
      ? `${APP_BASE_URL}/uploads/${uploadedFile.filename}`
      : "";

    const fileType = uploadedFile ? uploadedFile.mimetype || "" : "";

    const moduleQuery = `
      SELECT id, course_id, type, title, created_by_email
      FROM course_modules
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(moduleQuery, [moduleId], (moduleErr, moduleRes) => {
      if (moduleErr) {
        console.error("MODULE LOOKUP ERROR:", moduleErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate module",
        });
      }

      if (!moduleRes || moduleRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const module = moduleRes[0];

      if (module.type !== "quiz") {
        return res.status(400).json({
          success: false,
          message: "Submissions are only allowed for quiz modules",
        });
      }

      const attemptQuery = `
        SELECT COALESCE(MAX(attempt_number), 0) + 1 AS nextAttempt
        FROM quiz_submissions
        WHERE module_id = ? AND user_email = ?
      `;

      dbms.dbquery(attemptQuery, [module.id, req.user.email], (attemptErr, attemptRes) => {
        if (attemptErr) {
          console.error("ATTEMPT LOOKUP ERROR:", attemptErr);
          return res.status(500).json({
            success: false,
            message: "Failed to determine submission version",
          });
        }

        const nextAttempt = attemptRes?.[0]?.nextAttempt || 1;

        const clearLatestQuery = `
          UPDATE quiz_submissions
          SET is_latest = 0
          WHERE module_id = ? AND user_email = ?
        `;

        dbms.dbquery(clearLatestQuery, [module.id, req.user.email], (clearErr) => {
          if (clearErr) {
            console.error("CLEAR LATEST ERROR:", clearErr);
            return res.status(500).json({
              success: false,
              message: "Failed to prepare new submission",
            });
          }

          const insertQuery = `
            INSERT INTO quiz_submissions (
              module_id,
              course_id,
              user_email,
              answer_text,
              file_url,
              file_type,
              status,
              grade,
              feedback,
              reviewed_by_email,
              reviewed_at,
              attempt_number,
              is_latest
            )
            VALUES (?, ?, ?, ?, ?, ?, 'submitted', '', '', '', NULL, ?, 1)
          `;

          const values = [
            module.id,
            module.course_id,
            req.user.email,
            answerText || "",
            fileUrl,
            fileType,
            nextAttempt,
          ];

          dbms.dbquery(insertQuery, values, (insertErr, insertRes) => {
            if (insertErr) {
              console.error("SUBMISSION INSERT ERROR:", insertErr);
              return res.status(500).json({
                success: false,
                message: "Failed to submit quiz",
              });
            }
            const sendSuccessResponse = () => {
              return res.json({
                success: true,
                message: `Quiz submitted successfully (Attempt ${nextAttempt})`,
                data: {
                  id: insertRes.insertId,
                  module_id: module.id,
                  course_id: module.course_id,
                  user_email: req.user.email,
                  answer_text: answerText || "",
                  file_url: fileUrl,
                  file_type: fileType,
                  status: "submitted",
                  grade: "",
                  feedback: "",
                  attempt_number: nextAttempt,
                  is_latest: 1,
                },
              });
            };

            const trainerEmail = module.created_by_email
              ? String(module.created_by_email).trim().toLocaleLowerCase()
              : null;

            if (!trainerEmail || trainerEmail == req.user.email.toLocaleLowerCase()) {
              return sendSuccessResponse();
            }

            createNotification({
               
                recipientEmail: trainerEmail,
                actorEmail: req.user.email,
                type: "quiz_submitted",
                title: "New quiz submission received",
                message: `A learner submitted "${module.title || "a quiz"}".`,
                link: `/modules/${module.id}/submissions`,
              },
              (notificationErr) => {
                if (notificationErr) {
                  console.error("CREATE QUIZ SUBMISSION NOTIFICATION ERROR:", notificationErr);
                }

                return sendSuccessResponse();
              }
            );
          });
        });
      });
    });
  }
);

app.get("/api/my-submissions", authenticateToken, (req, res) => {
  const query = `
    SELECT
      qs.id,
      qs.module_id,
      qs.course_id,
      qs.user_email,
      qs.answer_text,
      qs.file_url,
      qs.file_type,
      qs.status,
      qs.grade,
      qs.feedback,
      qs.reviewed_by_email,
      qs.reviewed_at,
      qs.created_at,
      qs.attempt_number,
      qs.is_latest,
      cm.title AS module_title,
      c.title AS course_title
    FROM quiz_submissions qs
    LEFT JOIN course_modules cm ON qs.module_id = cm.id
    LEFT JOIN courses c ON qs.course_id = c.id
    WHERE qs.user_email = ?
    ORDER BY qs.created_at DESC
  `;

  dbms.dbquery(query, [req.user.email], (err, response) => {
    if (err) {
      console.error("MY SUBMISSIONS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.get("/api/dashboard/educator-stats",
  authenticateToken,
  authorizeRoles("educator"),
  (req, res) => {
    const totalQuizzesQuery = `
      SELECT COUNT(*) AS totalQuizzes
      FROM course_modules
      WHERE type = 'quiz'
    `;

    const submittedQuizzesQuery = `
      SELECT COUNT(DISTINCT module_id) AS submittedQuizzes
      FROM quiz_submissions
      WHERE user_email = ? AND is_latest = 1
    `;

    const averageGradeQuery = `
      SELECT AVG(CAST(grade AS DECIMAL(10,2))) AS averageGrade
      FROM quiz_submissions
      WHERE user_email = ?
        AND grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
        AND is_latest = 1
    `;

    const latestSubmissionQuery = `
      SELECT
        qs.id,
        qs.status,
        qs.grade,
        qs.feedback,
        qs.created_at,
        qs.module_id,
        qs.course_id,
        cm.title AS module_title,
        c.title AS course_title
      FROM quiz_submissions qs
      LEFT JOIN course_modules cm ON qs.module_id = cm.id
      LEFT JOIN courses c ON qs.course_id = c.id
      WHERE qs.user_email = ? AND qs.is_latest = 1
      ORDER BY qs.created_at DESC
      LIMIT 1
    `;

    dbms.dbquery(totalQuizzesQuery, (totalErr, totalRes) => {
      if (totalErr) {
        console.error("EDUCATOR TOTAL QUIZZES ERROR:", totalErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load stats",
        });
      }

      dbms.dbquery(
        submittedQuizzesQuery,
        [req.user.email],
        (submittedErr, submittedRes) => {
          if (submittedErr) {
            console.error("EDUCATOR SUBMITTED QUIZZES ERROR:", submittedErr);
            return res.status(500).json({
              success: false,
              message: "Failed to load stats",
            });
          }

          dbms.dbquery(
            averageGradeQuery,
            [req.user.email],
            (gradeErr, gradeRes) => {
              if (gradeErr) {
                console.error("EDUCATOR AVERAGE GRADE ERROR:", gradeErr);
                return res.status(500).json({
                  success: false,
                  message: "Failed to load stats",
                });
              }

              dbms.dbquery(
                latestSubmissionQuery,
                [req.user.email],
                (latestErr, latestRes) => {
                  if (latestErr) {
                    console.error("EDUCATOR LATEST SUBMISSION ERROR:", latestErr);
                    return res.status(500).json({
                      success: false,
                      message: "Failed to load stats",
                    });
                  }

                  const totalQuizzes = totalRes?.[0]?.totalQuizzes || 0;
                  const submittedQuizzes =
                    submittedRes?.[0]?.submittedQuizzes || 0;
                  const averageGrade = gradeRes?.[0]?.averageGrade || 0;

                  const completionPercentage =
                    totalQuizzes > 0
                      ? Math.round((submittedQuizzes / totalQuizzes) * 100)
                      : 0;

                  return res.json({
                    success: true,
                    data: {
                      totalQuizzes,
                      submittedQuizzes,
                      completionPercentage,
                      averageGrade: Number(averageGrade || 0).toFixed(2),
                      latestSubmission: latestRes?.[0] || null,
                    },
                  });
                }
              );
            }
          );
        }
      );
    });
  }
);

app.get("/api/dashboard/trainer-stats",
  authenticateToken,
  authorizeRoles("trainer", "admin"),
  (req, res) => {
    const pendingReviewsQuery = `
      SELECT COUNT(*) AS pendingReviews
      FROM quiz_submissions
      WHERE status = 'submitted' AND is_latest = 1
    `;

    const pendingByCourseQuery = `
      SELECT
        qs.course_id,
        c.title AS course_title,
        COUNT(*) AS pendingCount
      FROM quiz_submissions qs
      LEFT JOIN courses c ON qs.course_id = c.id
      WHERE qs.status = 'submitted' AND qs.is_latest = 1
      GROUP BY qs.course_id, c.title
      ORDER BY pendingCount DESC, qs.course_id ASC
      LIMIT 5
    `;

    dbms.dbquery(pendingReviewsQuery, (countErr, countRes) => {
      if (countErr) {
        console.error("TRAINER STATS COUNT ERROR:", countErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load trainer stats",
        });
      }

      dbms.dbquery(pendingByCourseQuery, (coursesErr, coursesRes) => {
        if (coursesErr) {
          console.error("TRAINER STATS COURSES ERROR:", coursesErr);
          return res.status(500).json({
            success: false,
            message: "Failed to load trainer stats",
          });
        }

        const pendingReviews = countRes?.[0]?.pendingReviews || 0;
        const topPendingCourses = coursesRes || [];

        return res.json({
          success: true,
          data: {
            pendingReviews,
            topPendingCourses,
            defaultPendingCourseId: topPendingCourses?.[0]?.course_id || null,
          },
        });
      });
    });
  }
);

app.get("/api/profile/me", authenticateToken, (req, res) => {
  
  const query = `
    SELECT
      p.email,
      COALESCE(p.photo, '') AS photo,
      COALESCE(p.fullname, '') AS fullname,
      COALESCE(p.role, 'educator') AS role,
      COALESCE(p.whatsapp, '') AS whatsapp,
      COALESCE(o.name, '') AS organization,
      p.organization_id,
      COALESCE(specialization, '') AS specialization
    FROM profile p
    LEFT JOIN organizations on ON p.organization_id = o.id
    WHERE email = ?
    LIMIT 1
  `;

  dbms.dbquery(query, [req.user.email], (err, response) => {
    if (err) {
      console.error("PROFILE LOAD ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load profile",
      });
    }

    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: response[0],
    });
  });
});

app.post("/api/profile/update", authenticateToken, (req, res) => {
  const {
    photo,
    fullname,
    whatsapp,
    specialization,
  } = req.body;

  const query = `
    UPDATE profile
    SET
      photo = ?,
      fullname = ?,
      whatsapp = ?,
      specialization = ?
    WHERE email = ?
  `;

  const values = [
    photo || "",
    fullname || "",
    whatsapp || "",
    specialization || "",
    req.user.email,
  ];

  dbms.dbquery(query, values, (err) => {
    if (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
    });
  });
});

app.post("/api/profile/upload-photo", authenticateToken, upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded.",
    });
  }

  const photoUrl = `${APP_BASE_URL}/uploads/${req.file.filename}`;

  const updateQuery = `UPDATE profile SET photo = ? WHERE email = ?`;

  dbms.dbquery(updateQuery, [photoUrl, req.user.email], (err) => {
    if (err) {
      console.error("PHOTO UPDATE ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to save photo",
      });
    }

    return res.json({
      success: true,
      photoUrl,
    });
  });
});


app.get("/api/discussions", authenticateToken, (req, res) => {
  const query = `
    SELECT
      d.id,
      d.title,
      d.question,
      d.author_email,
      d.created_at,
      p.fullname,
      p.role,
      p.photo
    FROM discussions d
    LEFT JOIN profile p ON p.email = d.author_email
    ORDER BY d.created_at DESC
  `;

  dbms.dbquery(query, [], (err, response) => {
    if (err) {
      console.error("GET DISCUSSIONS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch discussions",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.post("/api/discussions", authenticateToken, (req, res) => {
  const { title, question } = req.body;

  if (!title?.trim() || !question?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Title and question are required",
    });
  }

  const query = `
    INSERT INTO discussions (author_email, title, question)
    VALUES (?, ?, ?)
  `;

  dbms.dbquery(
    query,
    [req.user.email, title.trim(), question.trim()],
    (err, response) => {
      if (err) {
        console.error("CREATE DISCUSSION ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create discussion",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Discussion created successfully",
        discussionId: response.insertId,
      });
    }
  );
});

app.get("/api/discussions/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const discussionQuery = `
    SELECT
      d.id,
      d.title,
      d.question,
      d.author_email,
      d.created_at,
      p.fullname,
      p.role,
      p.photo
    FROM discussions d
    LEFT JOIN profile p ON p.email = d.author_email
    WHERE d.id = ?
    LIMIT 1
  `;

  const repliesQuery = `
    SELECT
      r.id,
      r.discussion_id,
      r.reply,
      r.author_email,
      r.created_at,
      p.fullname,
      p.role,
      p.photo
    FROM discussion_replies r
    LEFT JOIN profile p ON p.email = r.author_email
    WHERE r.discussion_id = ?
    ORDER BY r.created_at ASC
  `;

  dbms.dbquery(discussionQuery, [id], (discussionErr, discussionRes) => {
    if (discussionErr) {
      console.error("GET DISCUSSION ERROR:", discussionErr);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch discussion",
      });
    }

    if (!discussionRes || discussionRes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    dbms.dbquery(repliesQuery, [id], (repliesErr, repliesRes) => {
      if (repliesErr) {
        console.error("GET DISCUSSION REPLIES ERROR:", repliesErr);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch discussion replies",
        });
      }

      return res.json({
        success: true,
        data: {
          discussion: discussionRes[0],
          replies: repliesRes || [],
        },
      });
    });
  });
});

app.post("/api/discussions/:id/replies", authenticateToken, (req, res) => {
  const discussionId = Number(req.params.id);
  const replyText = String(req.body?.reply || "").trim();
  const authorEmail = String(req.user.email).trim().toLowerCase();

  if (!Number.isInteger(discussionId) || discussionId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid discussion id is required",
    });
  }

  if (!replyText) {
    return res.status(400).json({
      success: false,
      message: "Reply is required",
    });
  }

  const discussionOwnerQuery = `
    SELECT author_email
    FROM discussions
    WHERE id = ?
    LIMIT 1
  `;

  dbms.dbquery(discussionOwnerQuery, [discussionId], (ownerErr, ownerRes) => {
    if (ownerErr) {
      console.error("DISCUSSION OWNER LOOKUP ERROR:", ownerErr);
      return res.status(500).json({
        success: false,
        message: "Failed to validate discussion",
      });
    }

    if (!ownerRes || ownerRes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Discussion not found",
      });
    }

    const discussionAuthorEmail = ownerRes[0].author_email
      ? String(ownerRes[0].author_email).trim().toLowerCase()
      : null;

    const insertReplyQuery = `
      INSERT INTO discussion_replies (discussion_id, author_email, reply)
      VALUES (?, ?, ?)
    `;

    dbms.dbquery(
      insertReplyQuery,
      [discussionId, authorEmail, replyText],
      (insertErr, insertRes) => {
        if (insertErr) {
          console.error("CREATE DISCUSSION REPLY ERROR:", insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to post reply",
          });
        }

        const sendSuccessResponse = () => {
          return res.status(201).json({
            success: true,
            message: "Reply posted successfully",
            replyId: insertRes?.insertId || null,
          });
        };

        if (
          !discussionAuthorEmail ||
          discussionAuthorEmail === authorEmail
        ) {
          return sendSuccessResponse();
        }

        createNotification(
          {
            recipientEmail: discussionAuthorEmail,
            actorEmail: authorEmail,
            type: "discussion_reply",
            title: "New reply to your discussion",
            message: "Someone replied to your discussion.",
            link: `/discussion?id=${discussionId}`,
          },
          (notificationErr) => {
            if (notificationErr) {
              console.error(
                "CREATE DISCUSSION REPLY NOTIFICATION ERROR:",
                notificationErr
              );
            }

            return sendSuccessResponse();
          }
        );
      }
    );
  });
});

app.get("/api/profile/view", authenticateToken, (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
    });
  }

  const normalizedEmail = String(email).trim().toLocaleLowerCase();

  const query = `
    SELECT
      p.email,
      COALESCE(p.fullname, '') AS fullname,
      COALESCE(p.role, 'educator') AS role,
      COALESCE(p.photo, '') AS photo,
      COALESCE(p.whatsapp, '') AS whatsapp,
      COALESCE(o.name, '') AS organization,
      p.organization_id,
      COALESCE(p.specialization, '') AS specialization
    FROM profile p
    LEFT JOIN organizations o ON p.organization_id = o.id
    WHERE p.email = ?
    LIMIT 1
  `;

  dbms.dbquery(query, [normalizedEmail], (err, response) => {
    if (err) {
      console.error("PROFILE VIEW ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load profile",
      });
    }

    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: response[0],
    });
  });
});

//---ADMIN Routes---

app.get("/api/admin/stats",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const totalUsersQuery = `SELECT COUNT(*) AS totalUsers FROM users`;
    const totalCoursesQuery = `SELECT COUNT(*) AS totalCourses FROM courses`;
    const totalPrincipalsQuery = `
      SELECT COUNT(*) AS totalPrincipals
      FROM profile
      WHERE role = 'principal'
    `;
    const totalOrganizationsQuery = `
      SELECT COUNT(*) AS totalOrganizations
      FROM organizations
    `;

    dbms.dbquery(totalUsersQuery, (usersErr, usersRes) => {
      if (usersErr) {
        console.error("ADMIN STATS USERS ERROR:", usersErr);
        return res.status(500).json({ success: false, message: "Failed to load stats" });
      }

      dbms.dbquery(totalCoursesQuery, (coursesErr, coursesRes) => {
        if (coursesErr) {
          console.error("ADMIN STATS COURSES ERROR:", coursesErr);
          return res.status(500).json({ success: false, message: "Failed to load stats" });
        }

        dbms.dbquery(totalPrincipalsQuery, (principalsErr, principalsRes) => {
          if (principalsErr) {
            console.error("ADMIN STATS PRINCIPALS ERROR:", principalsErr);
            return res.status(500).json({ success: false, message: "Failed to load stats" });
          }

          dbms.dbquery(totalOrganizationsQuery, (orgsErr, orgsRes) => {
            if (orgsErr) {
              console.error("ADMIN STATS ORGANIZATIONS ERROR:", orgsErr);
              return res.status(500).json({ success: false, message: "Failed to load stats" });
            }

            return res.json({
              success: true,
              data: {
                totalUsers: usersRes?.[0]?.totalUsers || 0,
                totalCourses: coursesRes?.[0]?.totalCourses || 0,
                totalPrincipals: principalsRes?.[0]?.totalPrincipals || 0,
                totalOrganizations: orgsRes?.[0]?.totalOrganizations || 0,
              },
            });
          });
        });
      });
    });
  }
);

app.get( "/api/admin/users",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT
        u.email,
        COALESCE(p.fullname, '') AS fullname,
        COALESCE(p.role, 'educator') AS role,
        COALESCE(p.photo, '') AS photo,
        COALESCE(p.whatsapp, '') AS whatsapp,
        COALESCE(p.specialization, '') AS specialization,
        p.organization_id,
        COALESCE(o.name, '') AS organization
      FROM users u
      LEFT JOIN profile p ON p.email = u.email
      LEFT JOIN organizations o ON p.organization_id = o.id
      ORDER BY u.email ASC
    `;

    dbms.dbquery(query, (err, response) => {
      if (err) {
        console.error("ADMIN USERS ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch users",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });
  }
);

app.put( "/api/admin/users/:email/role",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { email } = req.params;
    const { role } = req.body;

    const allowedRoles = ["admin", "trainer", "educator", "principal"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const query = `
      UPDATE profile
      SET role = ?
      WHERE email = ?
    `;

    dbms.dbquery(query, [role, email], (err, response) => {
      if (err) {
        console.error("ADMIN ROLE UPDATE ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to update role",
        });
      }

      if (!response || response.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      return res.json({
        success: true,
        message: "Role updated successfully",
      });
    });
  }
);

app.post( "/api/admin/organizations",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { name, code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Organization name is required",
      });
    }

    const query = `
      INSERT INTO organizations (name, code)
      VALUES (?, ?)
    `;

    dbms.dbquery(query, [name.trim(), code || null], (err, response) => {
      if (err) {
        console.error("CREATE ORGANIZATION ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create organization",
        });
      }

      return res.json({
        success: true,
        message: "Organization created successfully",
        data: {
          id: response.insertId,
          name: name.trim(),
          code: code || null,
        },
      });
    });
  }
);

app.get( "/api/admin/organizations",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const query = `
      SELECT
        o.id,
        o.name,
        o.code,
        o.principal_email AS principalEmail,
        COALESCE(p.fullname, '') AS principalName
      FROM organizations o
      LEFT JOIN profile p ON p.email = o.principal_email
      ORDER BY o.name ASC
    `;

    dbms.dbquery(query, (err, response) => {
      if (err) {
        console.error("GET ORGANIZATIONS ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch organizations",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });
  }
);

app.put(
  "/api/admin/organizations/:id/principal",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { id } = req.params;
    const { principalEmail } = req.body;

    const orgId = Number(id);

    if (!Number.isInteger(orgId) || orgId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid organization id is required",
      });
    }

    const normalizedEmail =
      principalEmail && String(principalEmail).trim()
        ? String(principalEmail).trim().toLowerCase()
        : null;

    const orgCheckQuery = `
      SELECT id, name, principal_email
      FROM organizations
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(orgCheckQuery, [orgId], (orgErr, orgRes) => {
      if (orgErr) {
        console.error("ORG CHECK ERROR:", orgErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate organization",
        });
      }

      if (!orgRes || orgRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Organization not found",
        });
      }

      const organizationName = orgRes[0].name || "your organization";

      const previousPrincipalEmail = orgRes[0].principal_email
        ? String(orgRes[0].principal_email).trim().toLowerCase()
        : null;

      
      // Remove Principal Flow
      
      if (!normalizedEmail) {
        const clearOrgQuery = `
          UPDATE organizations
          SET principal_email = NULL
          WHERE id = ?
        `;

        dbms.dbquery(clearOrgQuery, [orgId], (clearErr) => {
          if (clearErr) {
            console.error("CLEAR PRINCIPAL ERROR:", clearErr);
            return res.status(500).json({
              success: false,
              message: "Failed to remove principal",
            });
          }

          if (previousPrincipalEmail) {
            const clearProfileQuery = `
              UPDATE profile
              SET organization_id = NULL
              WHERE email = ?
                AND organization_id = ?
            `;

            dbms.dbquery(
              clearProfileQuery,
              [previousPrincipalEmail, orgId],
              (profileErr) => {
                if (profileErr) {
                  console.error("CLEAR PROFILE ERROR:", profileErr);
                  return res.status(500).json({
                    success: false,
                    message: "Principal removed, but failed to update profile",
                  });
                }

                return res.json({
                  success: true,
                  message: "Principal removed successfully",
                });
              }
            );

            return;
          }

          return res.json({
            success: true,
            message: "Principal removed successfully",
          });
        });

        return;
      }

      // Assign Principal

      const principalCheckQuery = `
        SELECT u.email, p.role
        FROM users u
        JOIN profile p ON p.email = u.email
        WHERE u.email = ?
        LIMIT 1
      `;

      dbms.dbquery(principalCheckQuery, [normalizedEmail], (checkErr, checkRes) => {
        if (checkErr) {
          console.error("PRINCIPAL CHECK ERROR:", checkErr);
          return res.status(500).json({
            success: false,
            message: "Failed to validate principal",
          });
        }

        if (!checkRes || checkRes.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Principal not found",
          });
        }

        if (checkRes[0].role !== "principal") {
          return res.status(400).json({
            success: false,
            message: "Selected user is not a principal",
          });
        }

        const existingPrincipalOrgQuery = `
          SELECT id
          FROM organizations
          WHERE LOWER(TRIM(principal_email)) = ?
            AND id <> ?
          LIMIT 1
        `;

        dbms.dbquery(
          existingPrincipalOrgQuery,
          [normalizedEmail, orgId],
          (existingErr, existingRes) => {
            if (existingErr) {
              console.error("EXISTING PRINCIPAL CHECK ERROR:", existingErr);
              return res.status(500).json({
                success: false,
                message: "Failed to validate principal assignment",
              });
            }

            if (existingRes.length > 0) {
              return res.status(400).json({
                success: false,
                message: "Principal already assigned to another organization",
              });
            }

            const updateOrganizationQuery = `
              UPDATE organizations
              SET principal_email = ?
              WHERE id = ?
            `;

            dbms.dbquery(
              updateOrganizationQuery,
              [normalizedEmail, orgId],
              (updateErr) => {
                if (updateErr) {
                  console.error("ASSIGN PRINCIPAL ERROR:", updateErr);
                  return res.status(500).json({
                    success: false,
                    message: "Failed to assign principal",
                  });
                }

                const updateProfileQuery = `
                  UPDATE profile
                  SET organization_id = ?
                  WHERE email = ?
                `;

                dbms.dbquery(
                  updateProfileQuery,
                  [orgId, normalizedEmail],
                  (profileErr) => {
                    if (profileErr) {
                      console.error("PROFILE UPDATE ERROR:", profileErr);
                      return res.status(500).json({
                        success: false,
                        message: "Failed to update principal profile",
                      });
                    }

                    if (
                      previousPrincipalEmail &&
                      previousPrincipalEmail !== normalizedEmail
                    ) {
                      dbms.dbquery(
                        `UPDATE profile SET organization_id = NULL WHERE email = ?`,
                        [previousPrincipalEmail],
                        () => {}
                      );
                    }

                    createNotification(
                      {
                        recipientEmail: normalizedEmail,
                        actorEmail: req.user.email,
                        type: "principal_assigned",
                        title: "You were assigned as a principal",
                        message: `You are now the principal of ${organizationName}.`,
                        link: "/organization-management",
                      },
                      () => {}
                    );

                    return res.json({
                      success: true,
                      message: "Principal assigned successfully",
                    });
                  }
                );
              }
            );
          }
        );
      });
    });
  }
);

app.put( "/api/admin/users/:email/organization",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { email } = req.params;
    const { organizationId } = req.body;

    const query = `
      UPDATE profile
      SET organization_id = ?
      WHERE email = ?
    `;

    dbms.dbquery(query, [organizationId || null, email], (err, response) => {
      if (err) {
        console.error("ASSIGN USER ORGANIZATION ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to assign organization",
        });
      }

      if (!response || response.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "User profile not found",
        });
      }

      return res.json({
        success: true,
        message: "Organization assigned successfully",
      });
    });
  }
);

app.delete( "/api/admin/users/:email",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    const { email } = req.params;

    const deleteAssignmentsQuery = `
      DELETE FROM educator_course_assignments
      WHERE educator_email = ? OR assigned_by_email = ?
    `;

    const deleteSubmissionsQuery = `
      DELETE FROM quiz_submissions
      WHERE user_email = ? OR reviewed_by_email = ?
    `;

    const deleteProfileQuery = `
      DELETE FROM profile
      WHERE email = ?
    `;

    const deleteUserQuery = `
      DELETE FROM users
      WHERE email = ?
    `;

    dbms.dbquery(deleteAssignmentsQuery, [email, email], (assignErr) => {
      if (assignErr) {
        console.error("DELETE USER ASSIGNMENTS ERROR:", assignErr);
        return res.status(500).json({
          success: false,
          message: "Failed to delete user assignments",
        });
      }

      dbms.dbquery(deleteSubmissionsQuery, [email, email], (subErr) => {
        if (subErr) {
          console.error("DELETE USER SUBMISSIONS ERROR:", subErr);
          return res.status(500).json({
            success: false,
            message: "Failed to delete user submissions",
          });
        }

        dbms.dbquery(deleteProfileQuery, [email], (profileErr) => {
          if (profileErr) {
            console.error("DELETE USER PROFILE ERROR:", profileErr);
            return res.status(500).json({
              success: false,
              message: "Failed to delete user profile",
            });
          }

          dbms.dbquery(deleteUserQuery, [email], (userErr, response) => {
            if (userErr) {
              console.error("DELETE USER ACCOUNT ERROR:", userErr);
              return res.status(500).json({
                success: false,
                message: "Failed to delete user account",
              });
            }

            if (!response || response.affectedRows === 0) {
              return res.status(404).json({
                success: false,
                message: "User not found",
              });
            }

            return res.json({
              success: true,
              message: "User deleted successfully",
            });
          });
        });
      });
    });
  }
);

app.post( "/api/admin/users",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { fullname, email, password, role, organizationId } = req.body;

      if (!fullname || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Full name, email, password, and role are required",
        });
      }

      const normalizedEmail = String(email).trim().toLowerCase();
      const allowedRoles = ["admin", "trainer", "educator", "principal"];

      if (!allowedRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          message: "Invalid role",
        });
      }

      dbms.dbquery(
        "SELECT email FROM users WHERE email = ?",
        [normalizedEmail],
        async (checkErr, existingUsers) => {
          if (checkErr) {
            console.error("ADMIN CREATE USER CHECK ERROR:", checkErr);
            return res.status(500).json({
              success: false,
              message: "Database error while checking user",
            });
          }

          if (existingUsers && existingUsers.length > 0) {
            return res.status(409).json({
              success: false,
              message: "An account with this email already exists",
            });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          dbms.dbquery(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            [normalizedEmail, hashedPassword],
            (userErr) => {
              if (userErr) {
                console.error("ADMIN CREATE USER INSERT ERROR:", userErr);
                return res.status(500).json({
                  success: false,
                  message: "Failed to create user account",
                });
              }

              dbms.dbquery(
                `
                INSERT INTO profile (email, fullname, role, organization_id)
                VALUES (?, ?, ?, ?)
                `,
                [normalizedEmail, fullname, role, organizationId || null],
                (profileErr) => {
                  if (profileErr) {
                    console.error("ADMIN CREATE PROFILE INSERT ERROR:", profileErr);
                    return res.status(500).json({
                      success: false,
                      message: "User created, but profile creation failed",
                    });
                  }

                  return res.status(201).json({
                    success: true,
                    message: "User created successfully",
                  });
                }
              );
            }
          );
        }
      );
    } catch (error) {
      console.error("ADMIN CREATE USER ROUTE ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
);

//---END ADMIN Routes---

//---Principal Routes---
app.get( "/api/principal/dashboard",
  authenticateToken,
  authorizeRoles("principal", "admin"),
  (req, res) => {
    const orgQuery = `
      SELECT id, name
      FROM organizations
      WHERE principal_email = ?
      LIMIT 1
    `;

    dbms.dbquery(orgQuery, [req.user.email], (orgErr, orgRes) => {
      if (orgErr) {
        console.error("PRINCIPAL DASHBOARD ORG ERROR:", orgErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load principal organization",
        });
      }

      if (!orgRes || orgRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No organization assigned to this principal",
        });
      }

      const organizationId = orgRes[0].id;
      const organizationName = orgRes[0].name;

      const educatorsQuery = `
        SELECT COUNT(*) AS totalEducators
        FROM profile
        WHERE role = 'educator' AND organization_id = ?
      `;

      const activeAssignmentsQuery = `
        SELECT COUNT(*) AS activeAssignments
        FROM educator_course_assignments
        WHERE organization_id = ?
          AND status IN ('assigned', 'in_progress')
      `;

      const completedAssignmentsQuery = `
        SELECT COUNT(*) AS completedAssignments
        FROM educator_course_assignments
        WHERE organization_id = ?
          AND status = 'completed'
      `;

      dbms.dbquery(educatorsQuery, [organizationId], (educatorsErr, educatorsRes) => {
        if (educatorsErr) {
          console.error("PRINCIPAL DASHBOARD EDUCATORS ERROR:", educatorsErr);
          return res.status(500).json({
            success: false,
            message: "Failed to load dashboard stats",
          });
        }

        dbms.dbquery(activeAssignmentsQuery, [organizationId], (activeErr, activeRes) => {
          if (activeErr) {
            console.error("PRINCIPAL DASHBOARD ACTIVE ASSIGNMENTS ERROR:", activeErr);
            return res.status(500).json({
              success: false,
              message: "Failed to load dashboard stats",
            });
          }

          dbms.dbquery(completedAssignmentsQuery, [organizationId], (completedErr, completedRes) => {
            if (completedErr) {
              console.error("PRINCIPAL DASHBOARD COMPLETED ASSIGNMENTS ERROR:", completedErr);
              return res.status(500).json({
                success: false,
                message: "Failed to load dashboard stats",
              });
            }

            return res.json({
              success: true,
              data: {
                organizationId,
                organizationName,
                totalEducators: educatorsRes?.[0]?.totalEducators || 0,
                activeAssignments: activeRes?.[0]?.activeAssignments || 0,
                completedAssignments: completedRes?.[0]?.completedAssignments || 0,
              },
            });
          });
        });
      });
    });
  }
);

app.get("/api/principal/educators",
  authenticateToken,
  authorizeRoles("principal", "admin"),
  (req, res) => {
    const orgQuery = `
      SELECT id
      FROM organizations
      WHERE principal_email = ?
      LIMIT 1
    `;

    dbms.dbquery(orgQuery, [req.user.email], (orgErr, orgRes) => {
      if (orgErr) {
        console.error("PRINCIPAL EDUCATORS ORG ERROR:", orgErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load organization",
        });
      }

      if (!orgRes || orgRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No organization assigned to this principal",
        });
      }

      const organizationId = orgRes[0].id;

      const query = `
        SELECT
          p.email,
          COALESCE(p.fullname, '') AS fullname,
          COALESCE(p.specialization, '') AS specialization,
          COUNT(DISTINCT eca.course_id) AS assignedCourses,
          SUM(CASE WHEN eca.status IN ('assigned', 'in_progress') THEN 1 ELSE 0 END) AS activeCourses,
          SUM(CASE WHEN eca.status = 'completed' THEN 1 ELSE 0 END) AS completedCourses,
          AVG(
            CASE
              WHEN qs.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
              THEN CAST(qs.grade AS DECIMAL(10,2))
              ELSE NULL
            END
          ) AS averageGrade,
          MAX(qs.created_at) AS latestSubmissionAt
        FROM profile p
        LEFT JOIN educator_course_assignments eca
          ON eca.educator_email = p.email
        LEFT JOIN quiz_submissions qs
          ON qs.user_email = p.email
         AND qs.is_latest = 1
        WHERE p.role = 'educator'
          AND p.organization_id = ?
        GROUP BY p.email, p.fullname, p.specialization
        ORDER BY p.fullname ASC, p.email ASC
      `;

      dbms.dbquery(query, [organizationId], (err, response) => {
        if (err) {
          console.error("PRINCIPAL EDUCATORS ERROR:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch educators",
          });
        }

        return res.json({
          success: true,
          data: (response || []).map((row) => ({
            ...row,
            averageGrade:
              row.averageGrade !== null
                ? Number(row.averageGrade).toFixed(2)
                : null,
          })),
        });
      });
    });
  }
);

app.get("/api/principal/educator-performance",
  authenticateToken,
  authorizeRoles("principal", "admin"),
  (req, res) => {
    const organizationQuery = `
      SELECT id
      FROM organizations
      WHERE principal_email = ?
      LIMIT 1
    `;

    dbms.dbquery(organizationQuery, [req.user.email], (orgErr, orgRes) => {
      if (orgErr) {
        console.error("PRINCIPAL PERFORMANCE ORG LOOKUP ERROR:", orgErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load organization",
        });
      }

      if (!orgRes || orgRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No organization assigned to this principal",
        });
      }

      const organizationId = orgRes[0].id;

      const query = `
        SELECT
          p.email,
          COALESCE(p.fullname, '') AS fullname,
          COUNT(DISTINCT qs.module_id) AS submittedQuizzes,
          AVG(
            CASE
              WHEN qs.grade REGEXP '^[0-9]+(\\.[0-9]+)?$'
              THEN CAST(qs.grade AS DECIMAL(10,2))
              ELSE NULL
            END
          ) AS averageGrade,
          MAX(qs.created_at) AS latestSubmissionAt
        FROM profile p
        LEFT JOIN quiz_submissions qs
          ON qs.user_email = p.email
         AND qs.is_latest = 1
        WHERE p.role = 'educator' AND p.organization_id = ?
        GROUP BY p.email, p.fullname
        ORDER BY p.fullname ASC, p.email ASC
      `;

      dbms.dbquery(query, [organizationId], (err, response) => {
        if (err) {
          console.error("PRINCIPAL PERFORMANCE ERROR:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch educator performance",
          });
        }

        return res.json({
          success: true,
          data: (response || []).map((row) => ({
            ...row,
            averageGrade:
              row.averageGrade !== null
                ? Number(row.averageGrade).toFixed(2)
                : null,
          })),
        });
      });
    });
  }
);

app.get( "/api/principal/courses",
  authenticateToken,
  authorizeRoles("principal", "admin"),
  (req, res) => {
    const query = `
      SELECT
        id,
        title,
        instructor,
        lessons,
        quizzes,
        progress,
        thumbnail,
        description
      FROM courses
      ORDER BY id DESC
    `;

    dbms.dbquery(query, (err, response) => {
      if (err) {
        console.error("PRINCIPAL COURSES ERROR:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to fetch courses",
        });
      }

      return res.json({
        success: true,
        data: response || [],
      });
    });
  }
);

app.post( "/api/principal/assign-course",
  authenticateToken,
  authorizeRoles("principal", "admin"),
  (req, res) => {
    const educatorEmail = String(req.body?.educatorEmail || "").trim().toLowerCase();
    const courseId = Number(req.body?.courseId);
    const requesterEmail = String(req.user.email).trim().toLowerCase();

    if (!educatorEmail || !Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Educator email and valid course id are required",
      });
    }

    const orgQuery = `
      SELECT id
      FROM organizations
      WHERE principal_email = ?
      LIMIT 1
    `;

    dbms.dbquery(orgQuery, [requesterEmail], (orgErr, orgRes) => {
      if (orgErr) {
        console.error("ASSIGN COURSE ORG ERROR:", orgErr);
        return res.status(500).json({
          success: false,
          message: "Failed to load organization",
        });
      }

      if (!orgRes || orgRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No organization assigned to this principal",
        });
      }

      const organizationId = orgRes[0].id;

      const educatorQuery = `
        SELECT email
        FROM profile
        WHERE email = ?
          AND role = 'educator'
          AND organization_id = ?
        LIMIT 1
      `;

      dbms.dbquery(
        educatorQuery,
        [educatorEmail, organizationId],
        (educatorErr, educatorRes) => {
          if (educatorErr) {
            console.error("ASSIGN COURSE EDUCATOR CHECK ERROR:", educatorErr);
            return res.status(500).json({
              success: false,
              message: "Failed to validate educator",
            });
          }

          if (!educatorRes || educatorRes.length === 0) {
            return res.status(403).json({
              success: false,
              message: "Educator is not in your organization",
            });
          }

          const courseQuery = `
            SELECT id
            FROM courses
            WHERE id = ?
            LIMIT 1
          `;

          dbms.dbquery(courseQuery, [courseId], (courseErr, courseRes) => {
            if (courseErr) {
              console.error("ASSIGN COURSE COURSE CHECK ERROR:", courseErr);
              return res.status(500).json({
                success: false,
                message: "Failed to validate course",
              });
            }

            if (!courseRes || courseRes.length === 0) {
              return res.status(404).json({
                success: false,
                message: "Course not found",
              });
            }

            const insertQuery = `
              INSERT INTO educator_course_assignments (
                educator_email,
                course_id,
                assigned_by_email,
                organization_id,
                status
              )
              VALUES (?, ?, ?, ?, 'assigned')
            `;

            dbms.dbquery(
              insertQuery,
              [educatorEmail, courseId, requesterEmail, organizationId],
              (insertErr) => {
                if (insertErr) {
                  console.error("ASSIGN COURSE INSERT ERROR:", insertErr);

                  if (insertErr.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                      success: false,
                      message: "This course is already assigned to the educator",
                    });
                  }

                  return res.status(500).json({
                    success: false,
                    message: "Failed to assign course",
                  });
                }

                createNotification(
                  {
                    recipientEmail: educatorEmail,
                    actorEmail: requesterEmail,
                    type: "course_assigned",
                    title: "New course assigned",
                    message: "A new course has been assigned to you.",
                    link: `/course-details/${courseId}`,
                  },
                  (notificationErr) => {
                    if (notificationErr) {
                      console.error("CREATE NOTIFICATION ERROR:", notificationErr);
                    }

                    return res.json({
                      success: true,
                      message: "Course assigned successfully",
                    });
                  }
                );
              }
            );
          });
        }
      );
    });
  }
);

//--END Principal Routes---
//--Notifications---//

app.get("/api/notifications", authenticateToken, (req, res) => {
  const query = `
    SELECT
      id,
      recipient_email AS recipientEmail,
      actor_email AS actorEmail,
      type,
      title,
      message,
      link,
      is_read AS isRead,
      created_at AS createdAt,
      read_at AS readAt
    FROM notifications
    WHERE recipient_email = ?
    ORDER BY created_at DESC
    LIMIT 50
  `;

  dbms.dbquery(query, [req.user.email], (err, response) => {
    if (err) {
      console.error("GET NOTIFICATIONS ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load notifications",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.get("/api/notifications/unread-count", authenticateToken, (req, res) => {
  const query = `
    SELECT COUNT(*) AS unreadCount
    FROM notifications
    WHERE recipient_email = ?
      AND is_read = 0
  `;

  dbms.dbquery(query, [req.user.email], (err, response) => {
    if (err) {
      console.error("GET UNREAD NOTIFICATION COUNT ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to load unread notification count",
      });
    }

    return res.json({
      success: true,
      unreadCount: Number(response?.[0]?.unreadCount || 0),
    });
  });
});

app.post("/api/notifications/:id/read", authenticateToken, (req, res) => {
  const notificationId = Number(req.params.id);

  if (!Number.isInteger(notificationId) || notificationId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Valid notification id is required",
    });
  }

  const query = `
    UPDATE notifications
    SET is_read = 1,
        read_at = NOW()
    WHERE id = ?
      AND recipient_email = ?
  `;

  dbms.dbquery(query, [notificationId, req.user.email], (err, response) => {
    if (err) {
      console.error("MARK NOTIFICATION READ ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
      });
    }

    if (!response || response.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  });
});

app.post("/api/notifications/read-all", authenticateToken, (req, res) => {
  const query = `
    UPDATE notifications
    SET is_read = 1,
        read_at = NOW()
    WHERE recipient_email = ?
      AND is_read = 0
  `;

  dbms.dbquery(query, [req.user.email], (err) => {
    if (err) {
      console.error("MARK ALL NOTIFICATIONS READ ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to mark notifications as read",
      });
    }

    return res.json({
      success: true,
      message: "Notifications marked as read",
    });
  });
});

//--END Notifications--//

//-- Deletions --//

app.delete( "/api/courses/:id",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  (req, res) => {
    const courseId = Number(req.params.id);
    const requesterEmail = String(req.user.email).trim().toLowerCase();
    const requesterRole = String(req.user.role || "").trim().toLowerCase();

    if (!Number.isInteger(courseId) || courseId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid course id is required",
      });
    }

    const courseQuery = `
      SELECT id, uploaded_by_email
      FROM courses
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(courseQuery, [courseId], (courseErr, courseRes) => {
      if (courseErr) {
        console.error("DELETE COURSE CHECK ERROR:", courseErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate course",
        });
      }

      if (!courseRes || courseRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const course = courseRes[0];
      const ownerEmail = course.uploaded_by_email
        ? String(course.uploaded_by_email).trim().toLowerCase()
        : "";

      const isAdmin = requesterRole === "admin";
      const isOwner = ownerEmail === requesterEmail;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only delete courses you uploaded",
        });
      }

      const getModuleIdsQuery = `
        SELECT id
        FROM course_modules
        WHERE course_id = ?
      `;

      dbms.dbquery(getModuleIdsQuery, [courseId], (moduleErr, moduleRes) => {
        if (moduleErr) {
          console.error("DELETE COURSE MODULE LOOKUP ERROR:", moduleErr);
          return res.status(500).json({
            success: false,
            message: "Failed to load course modules",
          });
        }

        const moduleIds = (moduleRes || []).map((row) => Number(row.id)).filter(Boolean);

        const deleteAssignmentsQuery = `
          DELETE FROM educator_course_assignments
          WHERE course_id = ?
        `;

        dbms.dbquery(deleteAssignmentsQuery, [courseId], (assignErr) => {
          if (assignErr) {
            console.error("DELETE COURSE ASSIGNMENTS ERROR:", assignErr);
            return res.status(500).json({
              success: false,
              message: "Failed to delete course assignments",
            });
          }

          const deleteSubmissionsForModules = (done) => {
            if (moduleIds.length === 0) {
              return done();
            }

            const placeholders = moduleIds.map(() => "?").join(", ");
            const deleteSubmissionsQuery = `
              DELETE FROM quiz_submissions
              WHERE module_id IN (${placeholders})
            `;

            dbms.dbquery(deleteSubmissionsQuery, moduleIds, (subErr) => {
              if (subErr) {
                console.error("DELETE COURSE QUIZ SUBMISSIONS ERROR:", subErr);
                return res.status(500).json({
                  success: false,
                  message: "Failed to delete course submissions",
                });
              }

              return done();
            });
          };

          deleteSubmissionsForModules(() => {
            const deleteModulesQuery = `
              DELETE FROM course_modules
              WHERE course_id = ?
            `;

            dbms.dbquery(deleteModulesQuery, [courseId], (modulesDeleteErr) => {
              if (modulesDeleteErr) {
                console.error("DELETE COURSE MODULES ERROR:", modulesDeleteErr);
                return res.status(500).json({
                  success: false,
                  message: "Failed to delete course modules",
                });
              }

              const deleteCourseQuery = `
                DELETE FROM courses
                WHERE id = ?
              `;

              dbms.dbquery(deleteCourseQuery, [courseId], (deleteErr, deleteRes) => {
                if (deleteErr) {
                  console.error("DELETE COURSE ERROR:", deleteErr);
                  return res.status(500).json({
                    success: false,
                    message: "Failed to delete course",
                  });
                }

                if (!deleteRes || deleteRes.affectedRows === 0) {
                  return res.status(404).json({
                    success: false,
                    message: "Course not found",
                  });
                }

                return res.json({
                  success: true,
                  message: "Course deleted successfully",
                });
              });
            });
          });
        });
      });
    });
  }
);

app.delete( "/api/modules/:moduleId",
  authenticateToken,
  authorizeRoles("admin", "trainer"),
  (req, res) => {
    const moduleId = Number(req.params.moduleId);
    const requesterEmail = String(req.user.email).trim().toLowerCase();
    const requesterRole = String(req.user.role || "").trim().toLowerCase();

    if (!Number.isInteger(moduleId) || moduleId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid module id is required",
      });
    }

    const moduleQuery = `
      SELECT id, course_id, type, created_by_email
      FROM course_modules
      WHERE id = ?
      LIMIT 1
    `;

    dbms.dbquery(moduleQuery, [moduleId], (moduleErr, moduleRes) => {
      if (moduleErr) {
        console.error("DELETE MODULE CHECK ERROR:", moduleErr);
        return res.status(500).json({
          success: false,
          message: "Failed to validate module",
        });
      }

      if (!moduleRes || moduleRes.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const module = moduleRes[0];
      const ownerEmail = module.created_by_email
        ? String(module.created_by_email).trim().toLowerCase()
        : "";

      const isAdmin = requesterRole === "admin";
      const isOwner = ownerEmail === requesterEmail;

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          success: false,
          message: "You can only delete modules or quizzes you created",
        });
      }

      const deleteSubmissionsQuery = `
        DELETE FROM quiz_submissions
        WHERE module_id = ?
      `;

      dbms.dbquery(deleteSubmissionsQuery, [moduleId], (subErr) => {
        if (subErr) {
          console.error("DELETE MODULE SUBMISSIONS ERROR:", subErr);
          return res.status(500).json({
            success: false,
            message: "Failed to delete module submissions",
          });
        }

        const deleteModuleQuery = `
          DELETE FROM course_modules
          WHERE id = ?
        `;

        dbms.dbquery(deleteModuleQuery, [moduleId], (deleteErr, deleteRes) => {
          if (deleteErr) {
            console.error("DELETE MODULE ERROR:", deleteErr);
            return res.status(500).json({
              success: false,
              message: "Failed to delete module",
            });
          }

          if (!deleteRes || deleteRes.affectedRows === 0) {
            return res.status(404).json({
              success: false,
              message: "Module not found",
            });
          }

          recalculateCourseCounts(module.course_id, (recalcErr, counts) => {
            if (recalcErr) {
              console.error("RECALCULATE COURSE COUNTS ERROR:", recalcErr);
              return res.status(500).json({
                success: false,
                message: "Module deleted, but failed to update course counts",
              });
            }

            return res.json({
              success: true,
              message: `${module.type === "quiz" ? "Quiz" : "Module"} deleted successfully`,
              counts,
            });
          });
        });
      });
    });
  }
);

//-- END Deletions --//

app.post("/api/myinfo", (req, res) => {
  res.json({ test: "true" });
});


//---Google Search and YouTube Frame---
app.get("/api/resources/search", async (req, res) => {
  const { q = "", source = "google" } = req.query;

  if (!q.trim()) {
    return res.json({ success: true, data: [] });
  }

  if (!process.env.SERPAPI_KEY) {
    return res.status(500).json({
      success: false,
      data: [],
      message: "SERPAPI_KEY is missing in .env",
    });
  }

  try {
    const params = new URLSearchParams({
      api_key: process.env.SERPAPI_KEY,
      engine: source === "youtube" ? "youtube" : "google",
    });

    if (source === "youtube") {
      params.set("search_query", q);
    } else {
      params.set("q", q);
    }

    const response = await fetch(
      `https://serpapi.com/search.json?${params.toString()}`
    );

    const data = await response.json();
    console.log("SERP RAW:", data);

    let results = [];

    if (source === "youtube") {
      results = (data.video_results || []).map((item, index) => ({
        id: item.position || index + 1,
        title: item.title || "",
        link: item.link || "",
        thumbnail: item.thumbnail?.static || item.thumbnail || "",
        channel: item.channel?.name || "",
        published: item.published_date || "",
        duration: item.length || "",
        videoId: extractYouTubeId(item.link || ""),
        type: "youtube",
      }));
    } else {
      results = (data.organic_results || []).map((item, index) => ({
        id: item.position || index + 1,
        title: item.title || "",
        link: item.link || "",
        snippet: item.snippet || "",
        source: item.source || "",
        thumbnail: item.thumbnail || "",
        type: "google",
      }));
    }

    return res.json({ success: true, data: results });
  } catch (error) {
    console.error("SERP SEARCH ERROR:", error);
    return res.status(500).json({
      success: false,
      data: [],
      message: "Search failed",
    });
  }
});


////////////////////////////

app.get("/api/db-test", (req, res) => {
  const query = "SELECT 1 AS test";

  dbms.dbquery(query, (err, response) => {
    console.log("DB TEST err:", err);
    console.log("DB TEST response:", response);

    if (err) {
      return res.status(500).json({
        success: false,
        error: String(err),
        raw: err
      });
    }

    return res.json({ success: true, response });
  });
});

////////////////////////

app.use(express.static(path.join(__dirname, "../build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

if (require.main === module) {
  const options = {
    key: fs.readFileSync('./key.pem'),
    cert: fs.readFileSync('./cert.pem')
  };

  https.createServer(options, app).listen(PORT, "0.0.0.0", () => {
    console.log(`HTTPS Server running on Port: ${PORT}`);
  });
}

//if (require.main === module){
//    app.listen(PORT, "0.0.0.0",  () => {
//        console.log(`Server running on Port: ${PORT}`);
//   });
//}

module.exports = app;
