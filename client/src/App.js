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


function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/" element={<Welcome />} />
          
          <Route
            element={
              <ProtectedRoute>
              <AppLayout />
              </ProtectedRoute>
            }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/live" element={<LiveEvents />} />
          <Route path="/course-details/:id" element={<CourseDetails />} />
          <Route path="/upload" element={<UploadCourse />} />
          <Route path="/profile" element={<ProfileView />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;