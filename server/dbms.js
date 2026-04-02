/**
 * dbms.js
 *
 * This file contains functions for accessing the MySQL database.
 *
 */

exports.version = '0.0.1';


var mysql = require('mysql2'),
    async = require('async');

//var host = "localhost";
//var host = "pdx0mysql00.campus.up.edu";
var host = "cs341s26mwed.campus.up.edu";    //pdx0mysql00 IP address
var database = "malawi";  //database name
var user = "admin2";         //username (change to match your db)
var password = "123";  //password (change to match your db, yes THIS IS VERY POOR PRACTICE)

/**
 * dbquery
 *
 * performs a given SQL query on the database and returns the results
 * to the caller
 *
 * @param query     the SQL query to perform (e.g., "SELECT * FROM ...")
 * @param callback  the callback function to call with two values
 *                   error - (or 'false' if none)
 *                   results - as given by the mysql client
 */
exports.dbquery = function(query_str, callback) {

    var dbclient;
    var results = null;
    //still function 
    async.waterfall([

        //Step 1: Connect to the database
        function (callback) {
            console.log("\n** creating connection.");
            dbclient = mysql.createConnection({
                host: host,
                user: user,
                password: password,
                database: database,
            });

            dbclient.connect(callback);
        },

        //Step 2: Issue query
        function (results, callback) {
            console.log("\n** retrieving data");
            dbclient.query(query_str, function(err, rows, fields) {
	    if (err) {return callback(err);}
	    if (rows && rows.insertId != undefined) {return callback(null, rows, null);}
	    return callback(null, rows, fields);
	    });
	    console.log(callback);
        },
        //Step 3: Collect results
        function (rows, fields, callback) {
            console.log("\n** dumping data:");
            results = rows;
            console.log("" + rows);
	    console.log(callback);
            callback(null);
        }

    ],
    // waterfall cleanup function
    function (err, res) {
        if (err) {
            console.log("Database query failed.  sad");
            console.log(err);
            callback(err, null);
        } else {
            console.log("Database query completed.");
            callback(false, results);
        }

        //close connection to database
        dbclient.end();

    });

}//function dbquery
