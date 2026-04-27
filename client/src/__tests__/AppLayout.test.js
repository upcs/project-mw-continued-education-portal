import { render, screen } from "@testing-library/react";
import AppLayout from "../layout/AppLayout";

jest.mock("../layout/Sidebar", () => () => <div>Mock Sidebar</div>);
jest.mock("../layout/Topbar", () => () => <div>Mock Topbar</div>);

jest.mock("react-router-dom", () => ({
  Outlet: () => <div>Mock Outlet</div>,
}));

describe("AppLayout", () => {
  test("renders sidebar, topbar, and outlet content", () => {
    render(<AppLayout />);

    expect(screen.getByText("Mock Sidebar")).toBeInTheDocument();
    expect(screen.getByText("Mock Topbar")).toBeInTheDocument();
    expect(screen.getByText("Mock Outlet")).toBeInTheDocument();
  });
});