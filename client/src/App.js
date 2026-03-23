import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Dashboard from "./pages/Dashboard";
import CourseCatalog from "./pages/CourseCatalog";
import MyCourses from "./pages/MyCourses";
import Discussion from "./pages/Discussion";
import LiveEvents from "./pages/LiveEvents";
import CourseDetails from "./pages/CourseDetails";
import UploadCourse from "./pages/UploadCourse";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/catalog" element={<CourseCatalog />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/discussion" element={<Discussion />} />
          <Route path="/live" element={<LiveEvents />} />
          <Route path="/course-details/:id" element={<CourseDetails />} />
          <Route path="/upload" element={<UploadCourse />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;