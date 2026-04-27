import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import App from "../App";

jest.mock("../pages/Welcome", () => () => <div>Welcome Page</div>);
jest.mock("../pages/signup", () => () => <div>Signup Page</div>);
jest.mock("../pages/Unauthorized", () => () => <div>Unauthorized Page</div>);

jest.mock("../layout/AppLayout", () => () => <div>App Layout</div>);
jest.mock("../components/auth/ProtectedRoute", () => ({ children }) => (
  <>{children}</>
));

jest.mock("../pages/Dashboard", () => () => <div>Dashboard Page</div>);
jest.mock("../pages/CourseCatalog", () => () => <div>Catalog Page</div>);
jest.mock("../pages/MyCourses", () => () => <div>My Courses Page</div>);
jest.mock("../pages/Discussion", () => () => <div>Discussion Page</div>);
jest.mock("../pages/LiveEvents", () => () => <div>Live Events Page</div>);
jest.mock("../pages/CourseDetails", () => () => <div>Course Details Page</div>);
jest.mock("../pages/UploadCourse", () => () => <div>Upload Page</div>);
jest.mock("../pages/ProfileView", () => () => <div>Profile Page</div>);
jest.mock("../pages/AdminPage", () => () => <div>Admin Page</div>);
jest.mock("../pages/OrganizationsPage", () => () => <div>Organizations Page</div>);
jest.mock("../pages/EducatorProgressPage", () => () => <div>Educator Progress Page</div>);
jest.mock("../pages/MySubmissions", () => () => <div>My Submissions Page</div>);
jest.mock("../pages/CourseSubmissions", () => () => <div>Course Submissions Page</div>);
jest.mock("../pages/ReviewsRedirectPage", () => () => <div>Reviews Page</div>);
jest.mock("../pages/QuizBuilder", () => () => <div>Quiz Builder Page</div>);
jest.mock("../pages/TakeQuiz", () => () => <div>Take Quiz Page</div>);
jest.mock("../pages/QuizAttemptsReview", () => () => <div>Quiz Review Page</div>);

function renderAt(path) {
  window.history.pushState({}, "Test page", path);
  return render(<App />);
}

test("renders welcome route", () => {
  renderAt("/");
  expect(screen.getByText("Welcome Page")).toBeInTheDocument();
});

test("renders signup route", () => {
  renderAt("/signup");
  expect(screen.getByText("Signup Page")).toBeInTheDocument();
});

test("renders unauthorized route", () => {
  renderAt("/unauthorized");
  expect(screen.getByText("Unauthorized Page")).toBeInTheDocument();
});

test("renders quiz builder route", () => {
  renderAt("/quiz-builder/1");
  expect(screen.getByText("Quiz Builder Page")).toBeInTheDocument();
});

test("renders take quiz route", () => {
  renderAt("/take-quiz/1");
  expect(screen.getByText("Take Quiz Page")).toBeInTheDocument();
});

test("renders quiz review route", () => {
  renderAt("/quiz-review/1");
  expect(screen.getByText("Quiz Review Page")).toBeInTheDocument();
});