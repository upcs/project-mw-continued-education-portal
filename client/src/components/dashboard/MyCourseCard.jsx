import { GraduationCap, MoreHorizontal, User } from "lucide-react";

export default function MyCourseCard({
  title,
  author,
  progress = 0,
  onClick,
  surfaceClass = "",
  progressClass = "",
}) {
  const safeProgress = Math.max(0, Math.min(100, progress));

  const handleKeyDown = (e) => {
    if (!onClick) return;

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      className={`dashboard-course-card ${surfaceClass}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      <div className="dashboard-course-card__top">
        <GraduationCap size={20} />
        <MoreHorizontal size={18} />
      </div>

      <h3 className="dashboard-course-card__title">{title}</h3>

      <div className="dashboard-course-card__author">
        <User size={14} />
        <span>{author}</span>
      </div>

      <div className="dashboard-course-card__progress-visual">
        <div className={`dashboard-course-card__progress ${progressClass}`}>
          <div
            className="dashboard-course-card__progress-inner"
            style={{ width: `${safeProgress}%` }}
          />
        </div>
      </div>

      <p className="dashboard-course-card__progress-text">
        {safeProgress}%
      </p>
    </article>
  );
}