require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const dbms = require("./dbms.js");
const bcrypt = require("bcryptjs")
const multer = require("multer");
const fs = require("fs");

const app = express();
//const PORT = process.env.PORT || 5000;
const PORT = 3000;

app.use(cors());
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


app.get("/api/courses/:id/modules", (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT
      id,
      course_id,
      title,
      type,
      content,
      file_url,
      file_type,
      position
    FROM course_modules
    WHERE course_id = ?
    ORDER BY position ASC, id ASC
  `;

  dbms.dbquery(query, [id], (err, response) => {
    if (err) {
      console.error("GET MODULES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch modules",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.post("/api/courses/:id/modules", upload.single("moduleFile"), (req, res) => {
  const { id } = req.params;
  const { title, type, content } = req.body;

  if (!title || !type) {
    return res.status(400).json({
      success: false,
      message: "Title and type are required",
    });
  }

  const uploadedFile = req.file || null;

  const fileUrl = uploadedFile
    ? `http://localhost:${PORT}/uploads/${uploadedFile.filename}`
    : "";

  const fileType = uploadedFile
    ? (
        uploadedFile.mimetype ||
        (uploadedFile.originalname.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : uploadedFile.originalname.toLowerCase().endsWith(".txt")
          ? "text/plain"
          : uploadedFile.originalname.toLowerCase().endsWith(".md")
          ? "text/plain"
          : "")
      )
    : "";

  const positionQuery = `
    SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition
    FROM course_modules
    WHERE course_id = ?
  `;

  dbms.dbquery(positionQuery, [id], (posErr, posRes) => {
    if (posErr) {
      console.error("MODULE POSITION ERROR:", posErr);
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
        position
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      title,
      type,
      content || "",
      fileUrl,
      fileType,
      nextPosition,
    ];

    dbms.dbquery(insertQuery, values, (insertErr, insertRes) => {
      if (insertErr) {
        console.error("ADD MODULE ERROR:", insertErr);
        return res.status(500).json({
          success: false,
          message: "Failed to add module",
        });
      }

      return res.json({
        success: true,
        message: `${type === "quiz" ? "Quiz" : "Module"} added successfully`,
        data: {
          id: insertRes.insertId,
          course_id: Number(id),
          title,
          type,
          content: content || "",
          file_url: fileUrl,
          file_type: fileType,
          position: nextPosition,
        },
      });
    });
  });
});


app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.post("/api/auth/login", (req, res) => {
  console.log("hello");
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  dbms.dbquery(query, [email], async (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (!response || response.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = response[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid email or password" });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  });
});

app.post("/api/profile/change-password", (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const query = `SELECT * FROM users WHERE email = ?`;

  dbms.dbquery(query, [email], async (err, response) => {
    if (err) {
      console.error(err);
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

    dbms.dbquery(updateQuery, [hashedNewPassword, email], (err2) => {
      if (err2) {
        console.error(err2);
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
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    const checkQuery = `SELECT * FROM users WHERE email = ?`;

    dbms.dbquery(checkQuery, [email], async (checkErr, checkResponse) => {
      if (checkErr) {
        console.error(checkErr);
        return res.status(500).json({
          success: false,
          message: "Database error",
        });
      }

      if (checkResponse && checkResponse.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `
        INSERT INTO users (email, password)
        VALUES (?, ?)
      `;

      dbms.dbquery(insertQuery, [email, hashedPassword], (insertErr) => {
        if (insertErr) {
          console.error(insertErr);
          return res.status(500).json({
            success: false,
            message: "Failed to create account",
          });
        }

        return res.json({
          success: true,
          message: "Account created successfully",
        });
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


app.post("/api/courses/upload",
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
    } = req.body;

    if (!title || !instructor) {
      return res.status(400).json({
        success: false,
        message: "Title and instructor are required",
      });
    }

    const thumbnailFile = req.files?.thumbnail?.[0] || null;
    const courseFile = req.files?.courseFile?.[0] || null;

    const thumbnailUrl = thumbnailFile
      ? `http://localhost:${PORT}/uploads/${thumbnailFile.filename}`
      : "";

    const fileUrl = courseFile
      ? `http://localhost:${PORT}/uploads/${courseFile.filename}`
      : "";

   const fileType = courseFile
  ? (
      courseFile.mimetype ||
      (courseFile.originalname.toLowerCase().endsWith(".pdf")
        ? "application/pdf"
        : courseFile.originalname.toLowerCase().endsWith(".txt")
        ? "text/plain"
        : "")
    )
  : "";

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
        file_type
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        },
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
      file_type
    FROM courses
    ORDER BY id DESC;
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


app.get("/api/courses/enrolled", (req, res) => {
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
      console.error("ENROLLED COURSES ERROR:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch enrolled courses",
      });
    }

    return res.json({
      success: true,
      data: response || [],
    });
  });
});

app.get("/api/courses/:id", (req, res) => {
  const { id } = req.params;

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
      file_type
    FROM courses
    WHERE id = ?
  `;

  dbms.dbquery(courseQuery, [id], (err, courseResponse) => {
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
        title
      FROM course_modules
      WHERE course_id = ?
      ORDER BY id ASC
    `;

    dbms.dbquery(modulesQuery, [id], (modulesErr, modulesResponse) => {
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

app.post("/api/courses/:id/modules", upload.single("moduleFile"), (req, res) => {
  const { id } = req.params;
  const { title, type, content } = req.body;

  if (!title || !type) {
    return res.status(400).json({
      success: false,
      message: "Title and type are required",
    });
  }

  const uploadedFile = req.file || null;

  const fileUrl = uploadedFile
    ? `http://localhost:${PORT}/uploads/${uploadedFile.filename}`
    : "";

  const fileType = uploadedFile
    ? (
        uploadedFile.mimetype ||
        (uploadedFile.originalname.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : uploadedFile.originalname.toLowerCase().endsWith(".txt")
          ? "text/plain"
          : "")
      )
    : "";

  const positionQuery = `
    SELECT COALESCE(MAX(position), 0) + 1 AS nextPosition
    FROM course_modules
    WHERE course_id = ?
  `;

  dbms.dbquery(positionQuery, [id], (posErr, posRes) => {
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
        position
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      id,
      title,
      type,
      content || "",
      fileUrl,
      fileType,
      nextPosition,
    ];

    dbms.dbquery(insertQuery, values, (insertErr, response) => {
      if (insertErr) {
        console.error("ADD MODULE ERROR:", insertErr);
        return res.status(500).json({
          success: false,
          message: "Failed to add module",
        });
      }

      return res.json({
        success: true,
        message: `${type === "quiz" ? "Quiz" : "Module"} added successfully`,
        data: {
          id: response.insertId,
          course_id: Number(id),
          title,
          type,
          content: content || "",
          file_url: fileUrl,
          file_type: fileType,
          position: nextPosition,
        },
      });
    });
  });
});

app.post("/api/modules/:moduleId/upload",
  upload.single("moduleFile"),
  (req, res) => {
    const { moduleId } = req.params;
    const { content } = req.body;

    const uploadedFile = req.file || null;

    const fileUrl = uploadedFile
      ? `http://localhost:${PORT}/uploads/${uploadedFile.filename}`
      : "";

    const fileType = uploadedFile ? uploadedFile.mimetype || "" : "";

    const query = `
      UPDATE course_modules
      SET content = ?, file_url = ?, file_type = ?
      WHERE id = ?
    `;

    dbms.dbquery(
      query,
      [content || "", fileUrl, fileType, moduleId],
      (err) => {
        if (err) {
          console.error("MODULE UPLOAD ERROR:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to upload module file",
          });
        }

        return res.json({
          success: true,
          message: "Module updated successfully",
          data: {
            id: Number(moduleId),
            content: content || "",
            file_url: fileUrl,
            file_type: fileType,
          },
        });
      }
    );
  }
);

app.post("/api/profile", (req, res) => {
  const { email } = req.body;

  const query = `SELECT * FROM profile WHERE email="${email}";`;

  dbms.dbquery(query, (err, response) => {
    if (err) {
      return res.status(500).json([]);
    }

    return res.json(response);
  });
});

app.post("/api/profile/update", (req, res) => {
  const {
    email,
    photo,
    fullname,
    role,
    whatsapp,
    organization,
    specialization,
  } = req.body;

  const query = `
    UPDATE profile
    SET
      photo="${photo}",
      fullname="${fullname}",
      role="${role}",
      whatsapp="${whatsapp}",
      organization="${organization}",
      specialization="${specialization}"
    WHERE email="${email}";
  `;

  dbms.dbquery(query, (err, response) => {
    if (err) {
      console.error("PROFILE UPDATE ERROR:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });
  });
});

app.post("/api/profile/upload-photo", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "No file uploaded.",
    });
  }

  const photoUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;

  return res.json({
    success: true,
    photoUrl,
  });
});



app.post("/api/myinfo", (req, res) => {
  res.json({ test: "true" });
});


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

app.post("/api/courses/:id/modules", (req, res) => {
  res.json({ success: true, route: "add module works" });
});

app.put("/api/modules/:moduleId", (req, res) => {
  res.json({ success: true, route: "edit module works" });
});

app.delete("/api/modules/:moduleId", (req, res) => {
  res.json({ success: true, route: "delete module works" });
});

////////////////////////

app.use(express.static(path.join(__dirname, "../client/build")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

if (require.main === module){
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
   });
}

module.exports = app;
