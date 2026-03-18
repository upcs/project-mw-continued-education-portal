const dbms = require("../dbms.js");

query1 = `select * from userdata;`;
query2 = `insert into userdata (username, password) values ("hello", "hello")`;
const topping = 1;
const quantity = 1;
const notes = "a"
const month = 1;
const year = 1;
query = "insert into orders (quantity, notes, month, year) values (" + quantity + ", \"" + notes + "\" , " + month + ", " + year + ")";
function myfunction(err, response) {};

dbms.dbquery(query2, myfunction);
