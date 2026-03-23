import { User } from "lucide-react";

export default function CourseCard({
  title,
  author,
  lessons,
  quizzes,
}) {
  return (
    <article className="course-card">
      <div className="course-card__image">
        <div className="course-card__badge">Lorem Ipsum</div>
      </div>

      <div className="course-card__body">
        <h3 className="course-card__title">{title}</h3>

        <div className="course-card__meta">
          <User size={14} />
          <span>{author}</span>
        </div>

        <div className="course-card__footer">
          <span>{lessons} lessons</span>
          <span>•</span>
          <span>{quizzes} quiz</span>
        </div>
      </div>
    </article>
  );
}