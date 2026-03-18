const dbms = require('../dbms.js');

test("db select working", () => {
dbms.dbquery("Select * from userdata", (err, response) => {
var x = 1;
});
});
