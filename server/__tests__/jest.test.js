const { myinfo } = require("../server2");

beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
});

test("jest can run", () => {expect(true)});

fakereq = {
	body: {} 
	  }
fakeres = {
           json: jest.fn()
	  }
test("myinfo", (done) => {myinfo(fakereq, fakeres); done();});
