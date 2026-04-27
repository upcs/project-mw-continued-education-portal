import API from "../api/api";

describe("API interceptor", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function runInterceptor(config = { headers: {} }) {
    const interceptor = API.interceptors.request.handlers[0].fulfilled;
    return interceptor(config);
  }

  test("adds Authorization header when token exists", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ token: "test-token" })
    );

    const config = runInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer test-token");
  });

  test("does not add Authorization header when no user", () => {
    const config = runInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  test("does not add Authorization header when no token", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ email: "test@example.com" })
    );

    const config = runInterceptor({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  test("removes invalid JSON from localStorage", () => {
    localStorage.setItem("user", "invalid-json");

    const config = runInterceptor({ headers: {} });

    expect(localStorage.getItem("user")).toBeNull();
    expect(config.headers.Authorization).toBeUndefined();
  });

  test("returns config unchanged if headers already exist", () => {
    localStorage.setItem(
      "user",
      JSON.stringify({ token: "abc123" })
    );

    const config = runInterceptor({ headers: { existing: "value" } });

    expect(config.headers.existing).toBe("value");
    expect(config.headers.Authorization).toBe("Bearer abc123");
  });
});