import { GraduationCap, User } from "lucide-react";

export default function FeaturedCourseCard({
  variant = "light",
  subtitle,
  title,
  author,
}) {
  const isDark = variant === "dark";

  return (
    <article
      className={`featured-course-card ${
        isDark ? "featured-course-card--dark" : "featured-course-card--light"
      }`}
    >
      <div className="featured-course-card__top">
        <div className="featured-course-card__icon-wrap">
          <GraduationCap size={18} />
        </div>

        <div className="featured-course-card__meta">
          <span>5 lessons</span>
          <span>•</span>
          <span>4 quizes</span>
        </div>
      </div>

      <p className="featured-course-card__subtitle">{subtitle}</p>
      <h3 className="featured-course-card__title">{title}</h3>

      <div className="featured-course-card__author">
        <User size={14} />
        <span>{author}</span>
      </div>

      <div className="featured-course-card__illustration">
        {isDark ? "💻" : "🧑"}
      </div>
    </article>
  );
}