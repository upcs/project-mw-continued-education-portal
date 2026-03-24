import { render, screen } from "@testing-library/react";
import App from "../App";

describe("App routing", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("unauthenticated user cannot access dashboard", () => {
    window.history.pushState({}, "Test page", "/dashboard");
    render(<App />);

    expect(screen.getByText(/welcome/i)).toBeInTheDocument();
  });
});