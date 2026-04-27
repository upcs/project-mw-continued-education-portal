import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Welcome from "../pages/Welcome";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

jest.mock("../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../components/welcome/WelcomeNavbar", () => () => (
  <nav>Welcome Navbar</nav>
));

jest.mock("../components/welcome/WelcomeHero", () => () => (
  <section>Welcome Hero</section>
));

const { useAuth } = require("../context/AuthContext");

describe("Welcome page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders navbar and hero when not authenticated", () => {
    useAuth.mockReturnValue({
      isAuthenticated: false,
      authLoading: false,
    });

    render(<Welcome />);

    expect(screen.getByText("Welcome Navbar")).toBeInTheDocument();
    expect(screen.getByText("Welcome Hero")).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("redirects authenticated user to dashboard", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      authLoading: false,
    });

    render(<Welcome />);

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
      replace: true,
    });
  });

  test("does not redirect while auth is loading", () => {
    useAuth.mockReturnValue({
      isAuthenticated: true,
      authLoading: true,
    });

    render(<Welcome />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});