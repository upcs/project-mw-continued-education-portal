const dbms = require('../dbms.js');

beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
});
beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
});

test("db select working", (done) => {
dbms.dbquery("Select * from userdata", (err, response) => {
var x = 1;
done();
});
});

test("myfunction works", () => {});
