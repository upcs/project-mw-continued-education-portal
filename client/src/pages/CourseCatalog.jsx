import "../css/course-catalog.css";
import FilterTabs from "../components/courses/FilterTabs";
import CourseCard from "../components/courses/CourseCard";

const courses = Array(8).fill({
  title: "Lorem Ipsum mit sore de pas hala Madrid",
  author: "Shams Tabrez",
  lessons: 12,
  quizzes: 7,
});

export default function CourseCatalog() {
  return (
    <section className="course-catalog">
      <header className="course-catalog__header">
        <h1 className="course-catalog__title">All Courses</h1>
        <p className="course-catalog__breadcrumb">
          My Courses / catalog
        </p>
      </header>

      <FilterTabs />

      <div className="course-catalog__grid">
        {courses.map((course, index) => (
          <CourseCard key={index} {...course} />
        ))}
      </div>
    </section>
  );
}