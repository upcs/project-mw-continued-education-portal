/**
 * dbms.js
 *
 * Database helper with parameterized query support.
 */

exports.version = "0.0.2";

const mysql = require("mysql2");
const async = require("async");

//const host = "pdx0mysql00.campus.up.edu";
//const database = "cs341s26mwed";
//const user = "cs341s26mwed";
//const password = "UH(alVh_D1PR1We-";

const host = "localhost";
//var host = "pdx0mysql00.campus.up.edu";
//const host = "cs341s26mwed.campus.up.edu";    //pdx0mysql00 IP address
const database = "walawi";  //database name
const user = "admin2";         //username (change to match your db)
const password = "123";  //password (change to match your db, yes THIS IS VERY POOR PRACTICE)
exports.dbquery = function (queryStr, params, callback) {
  let dbclient;
  let results = null;

  if (typeof params === "function") {
    callback = params;
    params = [];
  }

  async.waterfall(
    [
      function (next) {
        console.log("\n** creating connection.");
        dbclient = mysql.createConnection({
          host,
          user,
          password,
          database,
        });

        dbclient.connect(next);
      },

      function (_ignored, next) {
        console.log("\n** retrieving data");

        dbclient.query(queryStr, params, function (err, rows, fields) {
          if (err) {
            return next(err);
          }

          if (rows && rows.insertId !== undefined) {
            return next(null, rows, null);
          }

          return next(null, rows, fields);
        });
      },

      function (rows, fields, next) {
        console.log("\n** dumping data:");
        results = rows;
        console.log(rows);
        next(null);
      },
    ],
    function (err) {
      if (dbclient) {
        dbclient.end();
      }

      if (err) {
        console.log("Database query failed.");
        console.log(err);
        return callback(err, null);
      }

      console.log("Database query completed.");
      return callback(false, results);
    }
  );
};
