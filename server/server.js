require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const dbms = require("./dbms.js");
const bcrypt = require("bcryptjs")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const query = `SELECT * FROM users WHERE email="${email}" AND password="${password}";`;

  dbms.dbquery(query, (err, response) => {
    console.log("LOGIN email:", email);
    console.log("LOGIN password:", password);
    console.log("LOGIN DB response:", response);

    if (err) {
      console.error(err);
      return res.status(500).json({ success: false });
    }

    if (response && response.length > 0) {
      return res.json({ success: true });
    }

    return res.json({ success: false });
  });
});


app.post("/api/auth/signup", (req, res) => {
  const { name, email, whatsapp, photo, username, password } = req.body;

  const query = `Select * from userdata where username = "${username}";`;
  const query2 = `insert into userdata values ("${username}", "${password}")`;
  const query3 = `insert into profile values ("${username}", "${name}", "${email}", "${whatsapp}", "${photo}")`;

  dbms.dbquery(query, (err, response) => {
    if (err) {
      return res.status(500).json({ error: "db" });
    }

    if (response[0] !== undefined) {
      return res.json({ error: "username" });
    }

    dbms.dbquery(query2, (err2) => {
      if (err2) {
        return res.json({ error: "db" });
      }

      dbms.dbquery(query3, (err3) => {
        if (err3) {
          return res.json({ error: "db" });
        }

        return res.json({ error: "none" });
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



module.exports = { app };