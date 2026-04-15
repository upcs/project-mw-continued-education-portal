import { useCallback, useEffect, useState } from "react";
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
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [message, setMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const canEditContent = user?.role === "admin" || user?.role === "trainer";

  const isEducator = user?.role === "educator";
  const isAdmin = user?.role === "admin";
  const isTrainer = user?.role === "trainer";

  const loadCourses = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleEnroll = async (courseId) => {
    try {
      setEnrollingCourseId(courseId);
      setError("");
      setMessage("");

      const { data } = await enrollInCourse(courseId);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to enroll in course");
      }

      setCourses((prev) =>
        prev.map((course) =>
          course.id === courseId
            ? {
                ...course,
                assignment_status: "in_progress",
                source: "self",
                progress: 0,
              }
            : course
        )
      );

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

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(
      `Delete "${courseTitle}" and all of its modules, quizzes, and submissions? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingCourseId(courseId);
      setError("");
      setMessage("");

      const { data } = await API.delete(`/courses/${courseId}`);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete course");
      }

      setCourses((prev) => prev.filter((course) => course.id !== courseId));
      setMessage("Course deleted successfully.");
    } catch (err) {
      console.error("DELETE COURSE ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to delete course."
      );
    } finally {
      setDeletingCourseId(null);
    }
  };

  const canDeleteCourse = (course) =>
    isAdmin ||
    (isTrainer &&
      course?.uploaded_by_email?.toLowerCase() === user?.email?.toLowerCase());

  return (
    <section className="course-catalog">
      <header className="course-catalog__header">
        <div>
          <h1 className="course-catalog__title">All Courses</h1>
          <p className="course-catalog__breadcrumb">My Courses / catalog</p>
        </div>

        {canEditContent && (
          <button
            type="button"
            className="course-catalog__edit-btn"
            onClick={() => setIsEditMode((prev) => !prev)}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>
        )}
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
            progress={course.progress}
            statusLabel={course.assignment_status}
            sourceLabel={
              course.source === "principal" ? "Principal Assigned" : "Self Enrolled"
            }
            actionLabel={
              isEducator
                ? enrollingCourseId === course.id
                  ? "Enrolling..."
                  : course.assignment_status === "completed"
                  ? "Completed"
                  : course.assignment_status === "assigned" ||
                    course.assignment_status === "in_progress"
                  ? "Enrolled"
                  : "Enroll"
                : ""
            }
            actionDisabled={
              enrollingCourseId === course.id ||
              deletingCourseId === course.id ||
              course.assignment_status === "assigned" ||
              course.assignment_status === "in_progress" ||
              course.assignment_status === "completed"
            }
            onAction={
              isEducator && !course.assignment_status
                ? () => handleEnroll(course.id)
                : null
            }
            canDelete={isEditMode && canDeleteCourse(course)}
            deleteLabel={
              deletingCourseId === course.id ? "Deleting..." : "Delete"
            }
            onDelete={
              canDeleteCourse(course)
                ? () => handleDeleteCourse(course.id, course.title)
                : null
            }
          />
        ))}
      </div>
    </section>
  );
}