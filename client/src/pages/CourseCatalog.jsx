import { useEffect, useState } from "react";
import "../css/course-catalog.css";
import FilterTabs from "../components/courses/FilterTabs";
import CourseCard from "../components/courses/CourseCard";

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:5000/api/courses");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch courses");
        }

        setCourses(result.data || []);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="course-catalog">
      <header className="course-catalog__header">
        <h1 className="course-catalog__title">All Courses</h1>
        <p className="course-catalog__breadcrumb">My Courses / catalog</p>
      </header>

      <FilterTabs />

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
          />
        ))}
      </div>
    </section>
  );
}