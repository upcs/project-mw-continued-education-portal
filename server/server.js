require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const dbms = require("./dbms.js");
const bcrypt = require("bcryptjs")
const multer = require("multer");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 5000;

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


app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.post("/api/auth/login", (req, res) => {
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

    const isMatch = await bcrypt.compare(password, user.password);

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