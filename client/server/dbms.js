/**
 * dbms.js
 * MySQL helper using a connection pool.
 */

const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

exports.version = "0.0.3";

exports.dbquery = function (queryStr, params, callback) {
  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  pool.query(queryStr, params, (err, rows) => {
    if (err) {
      console.error("Database query failed:", err);
      return callback(err, null);
    }

    return callback(null, rows);
  });
};
