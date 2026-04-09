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
  progress = null,
  actionLabel = "",
  onAction = null,
  actionDisabled = false,
  statusLabel = "",
  sourceLabel = "",
}) {
  const navigate = useNavigate();

  const normalizedProgress =
    progress === null || progress === undefined
      ? null
      : Math.max(0, Math.min(100, Number(progress) || 0));

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
          <span>{quizzes} {Number(quizzes) === 1 ? "quiz" : "quizzes"}</span>
        </div>

        {normalizedProgress !== null && (
          <div className="course-card__progress-block">
            <div className="course-card__progress-top">
              <span className="course-card__progress-label">Progress</span>
              <span className="course-card__progress-value">
                {normalizedProgress}%
              </span>
            </div>

            <div className="course-card__progress-bar">
              <div
                className="course-card__progress-fill"
                style={{ width: `${normalizedProgress}%` }}
              />
            </div>
          </div>
        )}

        {(statusLabel || sourceLabel) && (
          <div className="course-card__details">
            {statusLabel && (
              <p className="course-card__detail">
                <strong>Status:</strong> {statusLabel}
              </p>
            )}
            {sourceLabel && (
              <p className="course-card__detail">
                <strong>Source:</strong> {sourceLabel}
              </p>
            )}
          </div>
        )}

        {actionLabel && onAction && (
          <button
            type="button"
            className={`course-card__action ${
              actionLabel === "Completed"
              ? "course-card__action--completed"
              : actionLabel === "Enrolled"
              ? "course-card__action--enrolled"
              : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onAction();
            }}
            disabled={actionDisabled}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </article>
  );
}