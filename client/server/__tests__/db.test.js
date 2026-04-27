jest.mock("mysql2", () => {
  const queryMock = jest.fn();

  return {
    createPool: jest.fn(() => ({
      query: (...args) => queryMock(...args),
    })),
    __queryMock: queryMock,
  };
});

describe("dbms.js", () => {
  let dbms;
  let mysql2;

  beforeEach(() => {
    jest.resetModules();
    mysql2 = require("mysql2");
    mysql2.__queryMock.mockClear();
    dbms = require("../dbms.js");
  });

  test("dbquery with params", (done) => {
    mysql2.__queryMock.mockImplementation((sql, params, callback) => {
      callback(null, [{ id: 1 }]);
    });

    dbms.dbquery("SELECT * FROM users WHERE id = ?", [1], (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual([{ id: 1 }]);
      done();
    });
  });

  test("dbquery without params", (done) => {
    mysql2.__queryMock.mockImplementation((sql, params, callback) => {
      // 🔥 handle both signatures
      if (typeof params === "function") {
        return params(null, [{ test: 1 }]);
      }
      callback(null, [{ test: 1 }]);
    });

    dbms.dbquery("SELECT 1", (err, result) => {
      expect(err).toBeNull();
      expect(result).toEqual([{ test: 1 }]);
      done();
    });
  });

  test("dbquery handles errors", (done) => {
    const error = new Error("DB failed");

    mysql2.__queryMock.mockImplementation((sql, params, callback) => {
      callback(error, null); // ✅ match real behavior
    });

    dbms.dbquery("SELECT * FROM bad", [1], (err, result) => {
      expect(err).toBe(error);
      expect(result).toBeNull(); // ✅ FIXED
      done();
    });
  });
});