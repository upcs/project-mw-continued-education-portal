import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Welcome from "../pages/Welcome";

function Dashboard() {
  return <div>Dashboard Page</div>;
}

describe("Welcome page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <Welcome />
      </MemoryRouter>
    );

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test("logs in and navigates to dashboard", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "123456");
    await userEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(localStorage.getItem("isAuthenticated")).toBe("true");
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });
});