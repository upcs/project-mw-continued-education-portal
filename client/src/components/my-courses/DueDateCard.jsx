import { GraduationCap, CalendarDays } from "lucide-react";

export default function DueDateCard() {
  return (
    <article className="due-date-card">
      <div className="due-date-card__top">
        <div className="due-date-card__icon-wrap">
          <GraduationCap size={20} />
        </div>

        <div className="due-date-card__date-block">
          <h3 className="due-date-card__title">Due Date</h3>

          <div className="due-date-card__date-row">
            <CalendarDays size={14} />
            <span>Oct 02, 2022</span>
          </div>
        </div>
      </div>

      <p className="due-date-card__label">Assignment 04</p>
      <p className="due-date-card__description">
        Nisi, venenatis id cursus volutpat cursus interdum enim mauris.
      </p>
    </article>
  );
}