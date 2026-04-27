import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";
import API from "../api/api";
import { hasPermission as checkPermission } from "../utils/roles";

jest.mock("../api/api", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock("../utils/roles", () => ({
  hasPermission: jest.fn(),
}));

function TestComponent() {
  const {
    user,
    authLoading,
    login,
    logout,
    hasRole,
    hasPermission,
    isAuthenticated,
  } = useAuth();

  return (
    <div>
      <p>Loading: {authLoading ? "yes" : "no"}</p>
      <p>User: {user?.email || "none"}</p>
      <p>Authenticated: {isAuthenticated ? "yes" : "no"}</p>
      <p>Has Admin Role: {hasRole("admin") ? "yes" : "no"}</p>
      <p>Has Permission: {hasPermission("manage_users") ? "yes" : "no"}</p>

      <button
        onClick={() =>
          login({
            email: "test@example.com",
            password: "password123",
          })
        }
      >
        Login
      </button>

      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderAuthProvider() {
  return render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test("starts unauthenticated when no user is stored", async () => {
    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: no")).toBeInTheDocument();
    });

    expect(screen.getByText("User: none")).toBeInTheDocument();
    expect(screen.getByText("Authenticated: no")).toBeInTheDocument();
  });

  test("removes stored user if saved user has no token", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        email: "bad@example.com",
        role: "admin",
      })
    );

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: no")).toBeInTheDocument();
    });

    expect(localStorage.getItem("user")).toBeNull();
    expect(screen.getByText("User: none")).toBeInTheDocument();
  });

  test("bootstraps saved user with token from API", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "saved-token",
      })
    );

    API.get.mockResolvedValueOnce({
      data: {
        user: {
          email: "server@example.com",
          fullname: "Server User",
          role: "admin",
          photo: "avatar.png",
        },
      },
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("User: server@example.com")).toBeInTheDocument();
    });

    expect(API.get).toHaveBeenCalledWith("/auth/me");
    expect(localStorage.getItem("email")).toBe("server@example.com");
    expect(localStorage.getItem("name")).toBe("Server User");
    expect(localStorage.getItem("photo")).toBe("avatar.png");
    expect(localStorage.getItem("isAuthenticated")).toBe("true");
  });

  test("clears auth data when bootstrap API fails", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "bad-token",
      })
    );
    localStorage.setItem("email", "old@example.com");
    localStorage.setItem("name", "Old User");
    localStorage.setItem("photo", "old.png");
    localStorage.setItem("isAuthenticated", "true");

    API.get.mockRejectedValueOnce(new Error("Unauthorized"));

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: no")).toBeInTheDocument();
    });

    expect(screen.getByText("User: none")).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("email")).toBeNull();
    expect(localStorage.getItem("name")).toBeNull();
    expect(localStorage.getItem("photo")).toBeNull();
    expect(localStorage.getItem("isAuthenticated")).toBeNull();
  });

  test("login stores user and authentication data", async () => {
    API.post.mockResolvedValueOnce({
      data: {
        token: "login-token",
        user: {
          email: "login@example.com",
          fullname: "Login User",
          role: "student",
          photo: "login.png",
        },
      },
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Loading: no")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(screen.getByText("User: login@example.com")).toBeInTheDocument();
    });

    expect(API.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@example.com",
      password: "password123",
    });

    expect(localStorage.getItem("email")).toBe("login@example.com");
    expect(localStorage.getItem("name")).toBe("Login User");
    expect(localStorage.getItem("photo")).toBe("login.png");
    expect(localStorage.getItem("isAuthenticated")).toBe("true");
  });

  test("logout clears user and localStorage", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "saved-token",
      })
    );

    API.get.mockResolvedValueOnce({
      data: {
        user: {
          email: "logout@example.com",
          role: "admin",
        },
      },
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("User: logout@example.com")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Logout"));

    expect(screen.getByText("User: none")).toBeInTheDocument();
    expect(localStorage.getItem("user")).toBeNull();
    expect(localStorage.getItem("isAuthenticated")).toBeNull();
  });

  test("hasRole returns true for matching role", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "saved-token",
      })
    );

    API.get.mockResolvedValueOnce({
      data: {
        user: {
          email: "admin@example.com",
          role: "admin",
        },
      },
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Has Admin Role: yes")).toBeInTheDocument();
    });
  });

  test("hasPermission uses role permission checker", async () => {
    checkPermission.mockReturnValue(true);

    localStorage.setItem(
      "user",
      JSON.stringify({
        token: "saved-token",
      })
    );

    API.get.mockResolvedValueOnce({
      data: {
        user: {
          email: "admin@example.com",
          role: "admin",
        },
      },
    });

    renderAuthProvider();

    await waitFor(() => {
      expect(screen.getByText("Has Permission: yes")).toBeInTheDocument();
    });

    expect(checkPermission).toHaveBeenCalledWith("admin", "manage_users");
  });
});

test("hasRole returns true when role is included in an array", async () => {
  localStorage.setItem("user", JSON.stringify({ token: "saved-token" }));

  API.get.mockResolvedValueOnce({
    data: {
      user: {
        email: "trainer@example.com",
        role: "trainer",
      },
    },
  });

  renderAuthProvider();

  await waitFor(() => {
    expect(screen.getByText("Has Trainer Or Admin: yes")).toBeInTheDocument();
  });
});


test("clears invalid stored user JSON", async () => {
  localStorage.setItem("user", "{bad-json");

  renderAuthProvider();

  await waitFor(() => {
    expect(screen.getByText("Loading: no")).toBeInTheDocument();
  });

  expect(localStorage.getItem("user")).toBeNull();
  expect(screen.getByText("User: none")).toBeInTheDocument();
});

