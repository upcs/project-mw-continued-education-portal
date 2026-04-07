import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Welcome from "./pages/Welcome";
import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import MyCourses from "./pages/MyCourses";
import Discussion from "./pages/Discussion";
import LiveEvents from "./pages/LiveEvents";
import CourseDetails from "./pages/CourseDetails";
import UploadCourse from "./pages/UploadCourse";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ProfileView from "./pages/ProfileView";
import Signup from "./pages/signup";
import Unauthorized from "./pages/Unauthorized";

// placeholder pages if you create them
import AdminPage from "./pages/AdminPage";
import OrganizationsPage from "./pages/OrganizationsPage";
import EducatorProgressPage from "./pages/EducatorProgressPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/live" element={<LiveEvents />} />
          <Route path="/course-details/:id" element={<CourseDetails />} />
          <Route path="/profile" element={<ProfileView />} />

          <Route
            path="/upload"
            element={
              <ProtectedRoute allowedRoles={["admin", "trainer"]}>
                <UploadCourse />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/organizations"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <OrganizationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/educator-progress"
            element={
              <ProtectedRoute allowedRoles={["principal"]}>
                <EducatorProgressPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;