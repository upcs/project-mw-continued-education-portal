import { User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../css/course-card.css";

export default function CourseCard({
  id,
  title,
  author,
  lessons,
  quizzes,
  thumbnail,
}) {
  const navigate = useNavigate();

  return (
    <article className="course-card">
      <div
        className="course-card__image-wrap"
        onClick={() => navigate(`/course-details/${id}`)}
        style={{ cursor: "pointer" }}
      >
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="course-card__image"
          />
        ) : (
          <div className="course-card__image course-card__image--placeholder">
            No Cover
          </div>
        )}

        <div className="course-card__badge">Course</div>
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