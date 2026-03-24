import { ChevronLeft, ChevronRight } from "lucide-react";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const visibleDates = [26, 27, 28, 29, 30, 1, 2];

export default function CalendarPanel() {
  return (
    <section className="calendar-panel">
      <div className="calendar-panel__header">
        <button className="calendar-panel__nav-button">
          <ChevronLeft size={16} />
        </button>

        <h3 className="calendar-panel__month-title">Sept 2023</h3>

        <button className="calendar-panel__nav-button">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="calendar-panel__grid">
        {weekdays.map((day) => (
          <span className="calendar-panel__weekday" key={day}>
            {day}
          </span>
        ))}

        {visibleDates.map((date, index) => (
          <span
            key={date}
            className={`calendar-panel__date ${
              index === 4 || index === 6 ? "calendar-panel__date--active" : ""
            }`}
          >
            {String(date).padStart(2, "0")}
          </span>
        ))}
      </div>
    </section>
  );
}