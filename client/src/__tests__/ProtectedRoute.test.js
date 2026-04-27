import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

function renderProtectedRoute(authValue, props = {}) {
  useAuth.mockReturnValue(authValue);

  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute {...props}>
              <div>Protected Content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<div>Welcome Page</div>} />
        <Route path="/unauthorized" element={<div>Unauthorized Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("shows loading state while auth is loading", () => {
    renderProtectedRoute({
      user: null,
      authLoading: true,
      isAuthenticated: false,
      hasPermission: jest.fn(),
    });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("redirects unauthenticated users to welcome page", () => {
    renderProtectedRoute({
      user: null,
      authLoading: false,
      isAuthenticated: false,
      hasPermission: jest.fn(),
    });

    expect(screen.getByText("Welcome Page")).toBeInTheDocument();
  });

  test("renders children for authenticated user with no role or permission requirements", () => {
    renderProtectedRoute({
      user: { role: "user" },
      authLoading: false,
      isAuthenticated: true,
      hasPermission: jest.fn(),
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("renders children when user role is allowed", () => {
    renderProtectedRoute(
      {
        user: { role: "manager" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission: jest.fn(),
      },
      { allowedRoles: ["manager"] }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("redirects authenticated user when role is not allowed", () => {
    renderProtectedRoute(
      {
        user: { role: "staff" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission: jest.fn(),
      },
      { allowedRoles: ["manager"] }
    );

    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
  });

  test("allows admin even when role is not listed", () => {
    renderProtectedRoute(
      {
        user: { role: "admin" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission: jest.fn(),
      },
      { allowedRoles: ["manager"] }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  test("renders children when user has required permission", () => {
    const hasPermission = jest.fn(() => true);

    renderProtectedRoute(
      {
        user: { role: "staff" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission,
      },
      { requiredPermission: "view_reports" }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(hasPermission).toHaveBeenCalledWith("view_reports");
  });

  test("redirects when user lacks required permission", () => {
    const hasPermission = jest.fn(() => false);

    renderProtectedRoute(
      {
        user: { role: "staff" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission,
      },
      { requiredPermission: "view_reports" }
    );

    expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
    expect(hasPermission).toHaveBeenCalledWith("view_reports");
  });

  test("allows admin even without required permission", () => {
    const hasPermission = jest.fn(() => false);

    renderProtectedRoute(
      {
        user: { role: "admin" },
        authLoading: false,
        isAuthenticated: true,
        hasPermission,
      },
      { requiredPermission: "view_reports" }
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    expect(hasPermission).not.toHaveBeenCalled();
  });
});