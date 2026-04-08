import { useEffect, useState } from "react";
import "../css/course-catalog.css";
import FilterTabs from "../components/courses/FilterTabs";
import CourseCard from "../components/courses/CourseCard";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { enrollInCourse } from "../api/courses";

export default function CourseCatalog() {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [message, setMessage] = useState("");

  const isEducator = user?.role === "educator";

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");
        setMessage("");

        const { data } = await API.get("/courses");

        if (!data?.success) {
          throw new Error(data?.message || "Failed to fetch courses");
        }

        setCourses(data.data || []);
      } catch (err) {
        console.error("COURSE CATALOG ERROR:", err);
        setError(
          err?.response?.data?.message || err.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      setError("");
      setMessage("");

      const { data } = await enrollInCourse(courseId);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to enroll in course");
      }

      setMessage("Successfully enrolled in course.");
    } catch (err) {
      console.error("ENROLL COURSE ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to enroll"
      );
    } finally {
      setEnrollingCourseId(null);
    }
  };

  return (
    <section className="course-catalog">
      <header className="course-catalog__header">
        <h1 className="course-catalog__title">All Courses</h1>
        <p className="course-catalog__breadcrumb">My Courses / catalog</p>
      </header>

      <FilterTabs />

      {message && <p className="course-catalog__message">{message}</p>}
      {loading && <p>Loading courses...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && courses.length === 0 && <p>No courses found.</p>}

      <div className="course-catalog__grid">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.id}
            title={course.title}
            author={course.instructor}
            lessons={course.lessons}
            quizzes={course.quizzes}
            thumbnail={course.thumbnail}
            statusLabel={course.assignment_status}
            sourceLabel={course.source === "principal" ? "Principal Assigned" : "Self Enrolled"}
            actionLabel={
              isEducator
                ? enrollingCourseId === course.id
                ? "Enrolling..."
                : "Enroll"
              : ""
            }
            actionDisabled={enrollingCourseId === course.id}
            onAction={
              isEducator ? () => handleEnroll(course.id) : null
            }
          />
        ))}
      </div>
    </section>
  );
}