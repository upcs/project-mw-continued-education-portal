import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/auth/ProtectedRoute";

function SecretPage() {
  return <div>Secret Dashboard</div>;
}

function WelcomePage() {
  return <div>Welcome Page</div>;
}

describe("ProtectedRoute", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("redirects unauthenticated users to welcome page", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SecretPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Welcome Page")).toBeInTheDocument();
  });

  test("renders protected content when authenticated", () => {
    localStorage.setItem("isAuthenticated", "true");

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/" element={<WelcomePage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <SecretPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Secret Dashboard")).toBeInTheDocument();
  });
});