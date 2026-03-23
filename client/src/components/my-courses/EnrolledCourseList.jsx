import EnrolledCourseRow from "./EnrolledCourseRow";

export default function EnrolledList() {
  const courses = Array.from({ length: 8 }, (_, index) => ({
  id: index + 1,
  title: `Software Engineering ${index + 1}`,
  author: "Hassinullah Niazy",
  progress: 30,
  lessons: `10`,
  quizzes: `2`,
}));

  return (
    <div className="enrolled">
    
      <div className="enrolled__list">
        {courses.map((course) => (
          <EnrolledCourseRow
          key={course.id}
          id={course.id}
          title={course.title}
          progress={course.progress}
          lessons={course.lessons}
          quizzes={course.quizzes}
        />
        ))}
      </div>
    </div>
  );
}