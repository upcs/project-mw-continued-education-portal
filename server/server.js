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


app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.post("/api/auth/login", (req, res) => {
  console.log("hello");
  const { email, password } = req.body;
  const query = `SELECT * FROM users WHERE email="${email}";`;

  dbms.dbquery(query, async (err, response) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (!response || response.length === 0) {
      return res.json({ success: false });
    }
   

    const user = response[0];
  //  const hashedNewPassword = await bcrypt.hash(user.password);
    const isMatch = await bcrypt.compare(password, user.password);

     console.log(user.email, user.password);
    if (isMatch) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  });
});

app.post("/api/profile/change-password", (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  const query = `SELECT * FROM users WHERE email="${email}";`;

  dbms.dbquery(query, async (err, response) => {
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

    const updateQuery = `UPDATE users SET password="${hashedNewPassword}" WHERE email="${email}";`;

    dbms.dbquery(updateQuery, (err2) => {
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

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `INSERT INTO users (email, password) VALUES ("${email}", "${hashedPassword}");`;

    dbms.dbquery(query, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ success: false });
      }

      return res.json({ success: true });
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
});

app.get("/api/courses", (req, res) => {
  const query = `
    SELECT
      id,
      title,
      instructor AS author,
      lessons,
      quizzes,
      thumbnail,
      description
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
      progress,
      thumbnail
    FROM courses
    ORDER BY id DESC;
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
      quizzes
    FROM courses
    WHERE id = "${id}";
  `;

  dbms.dbquery(courseQuery, (err, courseResponse) => {
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
      WHERE course_id = "${id}"
      ORDER BY id ASC;
    `;

    dbms.dbquery(modulesQuery, (modulesErr, modulesResponse) => {
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
