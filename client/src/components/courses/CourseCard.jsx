import { BookOpen, ClipboardList, User } from "lucide-react";
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
  canDelete = false,
  deleteLabel = "Delete",
  onDelete = null,
}) {
  const navigate = useNavigate();

  const normalizedProgress =
    progress === null || progress === undefined
      ? null
      : Math.max(0, Math.min(100, Number(progress) || 0));

  const hasPrimaryAction = Boolean(actionLabel && onAction);
  const hasDeleteAction = Boolean(canDelete && onDelete);

  const actionClass =
    actionLabel === "Completed"
      ? "course-card__action course-card__action--completed"
      : actionLabel === "Enrolled"
      ? "course-card__action course-card__action--enrolled"
      : "course-card__action";

  const openCourse = () => {
    if (!id) return;
    navigate(`/course-details/${id}`);
  };

  return (
    <article className="course-card">
      <button
        type="button"
        className="course-card__image-wrap"
        onClick={openCourse}
        aria-label={`Open ${title}`}
      >
        {thumbnail ? (
          <img src={thumbnail} alt={title} className="course-card__image" />
        ) : (
          <div className="course-card__image course-card__image--placeholder">
            <BookOpen size={32} />
            <span>No Cover</span>
          </div>
        )}

        <span className="course-card__badge">Course</span>
      </button>

      <div className="course-card__body">
        <button type="button" className="course-card__title-btn" onClick={openCourse}>
          <h3 className="course-card__title">{title || "Untitled Course"}</h3>
        </button>

        <div className="course-card__meta">
          <User size={14} />
          <span>{author || "Unknown Instructor"}</span>
        </div>

        <div className="course-card__footer">
          <span>
            <BookOpen size={14} />
            {Number(lessons) || 0} lessons
          </span>

          <span>
            <ClipboardList size={14} />
            {Number(quizzes) || 0} {Number(quizzes) === 1 ? "quiz" : "quizzes"}
          </span>
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
              <span className="course-card__pill">
                Status: {String(statusLabel).replaceAll("_", " ")}
              </span>
            )}

            {sourceLabel && (
              <span className="course-card__pill course-card__pill--source">
                {sourceLabel}
              </span>
            )}
          </div>
        )}

        {(hasPrimaryAction || hasDeleteAction) && (
          <div className="course-card__actions">
            {hasPrimaryAction && (
              <button
                type="button"
                className={actionClass}
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                disabled={actionDisabled}
              >
                {actionLabel}
              </button>
            )}

            {hasDeleteAction && (
              <button
                type="button"
                className="course-card__delete"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={deleteLabel === "Deleting..."}
              >
                {deleteLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}