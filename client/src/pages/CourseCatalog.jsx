import { useCallback, useEffect, useMemo, useState } from "react";
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

  const isEducator = user?.role === "educator";
  const isAdmin = user?.role === "admin";
  const isTrainer = user?.role === "trainer";
  const canEditContent = isAdmin || isTrainer;

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
        err?.response?.data?.message ||
          err.message ||
          "Something went wrong while loading courses."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const courseStats = useMemo(() => {
    const total = courses.length;
    const enrolled = courses.filter((course) =>
      ["assigned", "in_progress", "completed"].includes(
        course.assignment_status
      )
    ).length;

    return { total, enrolled };
  }, [courses]);

  const isEnrolled = (course) =>
    ["assigned", "in_progress", "completed"].includes(
      course.assignment_status
    );

  const canDeleteCourse = (course) => {
    if (isAdmin) return true;

    if (!isTrainer) return false;

    return (
      course?.uploaded_by_email?.toLowerCase() === user?.email?.toLowerCase()
    );
  };

  const getSourceLabel = (course) => {
    if (!course.assignment_status) return "";

    if (course.source === "principal") return "Principal Assigned";
    if (course.source === "self") return "Self Enrolled";

    return "";
  };

  const getActionLabel = (course) => {
    if (!isEducator) return "";

    if (enrollingCourseId === course.id) return "Enrolling...";
    if (course.assignment_status === "completed") return "Completed";
    if (isEnrolled(course)) return "Enrolled";

    return "Enroll";
  };

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
        err?.response?.data?.message ||
          err.message ||
          "Failed to enroll in course."
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
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete course."
      );
    } finally {
      setDeletingCourseId(null);
    }
  };

  return (
    <section className="course-catalog">
      <header className="course-catalog__header">
        <div>
          <p className="course-catalog__eyebrow">Course Library</p>
          <h1 className="course-catalog__title">Course Catalogue</h1>
        </div>

        {canEditContent && (
          <button
            type="button"
            className={`course-catalog__edit-btn ${
              isEditMode ? "course-catalog__edit-btn--active" : ""
            }`}
            onClick={() => setIsEditMode((prev) => !prev)}
          >
            {isEditMode ? "Done" : "Edit"}
          </button>
        )}
      </header>

      <div className="course-catalog__stats">
        <div className="course-catalog__stat-card">
          <p>Total Courses</p>
          <h3>{courseStats.total}</h3>
        </div>

        {isEducator && (
          <div className="course-catalog__stat-card">
            <p>My Enrolled</p>
            <h3>{courseStats.enrolled}</h3>
          </div>
        )}

        {canEditContent && (
          <div className="course-catalog__stat-card">
            <p>Edit Mode</p>
            <h3>{isEditMode ? "On" : "Off"}</h3>
          </div>
        )}
      </div>

      <FilterTabs />

      {message && <p className="course-catalog__message">{message}</p>}
      {error && <p className="course-catalog__error">{error}</p>}
      {loading && <p className="course-catalog__muted">Loading courses...</p>}

      {!loading && !error && courses.length === 0 && (
        <div className="course-catalog__empty">
          <h3>No courses found</h3>
          <p>Courses will appear here once they are created.</p>
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
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
              sourceLabel={getSourceLabel(course)}
              actionLabel={getActionLabel(course)}
              actionDisabled={
                enrollingCourseId === course.id ||
                deletingCourseId === course.id ||
                isEnrolled(course)
              }
              onAction={
                isEducator && !isEnrolled(course)
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
      )}
    </section>
  );
}