import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import MyCourses from "../pages/MyCourses";

function CatalogPage() {
  return <div>Catalog Page</div>;
}

describe("MyCourses page", () => {
  test("catalog button navigates to catalog", async () => {
    render(
      <MemoryRouter initialEntries={["/my-courses"]}>
        <Routes>
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/catalog" element={<CatalogPage />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByRole("button", { name: /course catalog/i }));
    expect(screen.getByText("Catalog Page")).toBeInTheDocument();
  });
});