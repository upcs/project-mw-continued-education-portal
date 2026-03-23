import { GraduationCap, MoreHorizontal, User } from "lucide-react";

export default function MyCourseCard({
  title,
  author,
  surfaceClass = "",
  progressClass = "",
}) {
  return (
    <article className={`dashboard-course-card ${surfaceClass}`}>
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
          <div className="dashboard-course-card__progress-inner" />
        </div>
      </div>
    </article>
  );
}