import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import EnrolledCourseRow from "../components/my-courses/EnrolledCourseRow";

function CourseDetails() {
  return <div>Course Details Page</div>;
}

describe("EnrolledCourseRow", () => {
  test("navigates to course details on row click", async () => {
    render(
      <MemoryRouter initialEntries={["/my-courses"]}>
        <Routes>
          <Route
            path="/my-courses"
            element={
              <EnrolledCourseRow
                id={7}
                title="Software Engineering"
                progress={30}
                lessons="2/10"
                quizzes="3/5"
              />
            }
          />
          <Route path="/course-details/:id" element={<CourseDetails />} />
        </Routes>
      </MemoryRouter>
    );

    await userEvent.click(screen.getByText("Software Engineering"));
    expect(screen.getByText("Course Details Page")).toBeInTheDocument();
  });
});