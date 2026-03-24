import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Sidebar from "../layout/Sidebar";

function Dashboard() {
  return <div>Dashboard</div>;
}

function MyCourses() {
  return <div>My Courses</div>;
}

function Discussion() {
  return <div>Discussion</div>;
}

function Live() {
  return <div>Live</div>;
}

function UploadCourse() {
  return <div>Upload</div>;
}

describe("Sidebar", () => {
  test("navigates to upload page", async () => {

    render(
      <MemoryRouter initialEntries={["/"]}>
        <Sidebar />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/live" element={<Live />} />
          <Route path="/upload" element={<UploadCourse />} />
        </Routes>
      </MemoryRouter>
    );

    const links = screen.getAllByRole("link");
    await userEvent.click(links[3]);

    expect(screen.getByText("Upload")).toBeInTheDocument();
  });
});