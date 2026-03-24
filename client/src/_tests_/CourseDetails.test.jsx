import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import CourseDetails from "../pages/CourseDetails";

describe("CourseDetails page", () => {
  test("renders course details content", () => {
    render(
      <MemoryRouter initialEntries={["/course-details/5"]}>
        <Routes>
          <Route path="/course-details/:id" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/fundamentals of electronics/i)).toBeInTheDocument();
  });
});