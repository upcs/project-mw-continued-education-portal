const chartBars = [
  { day: "SAT", height: "26%" },
  { day: "SUN", height: "64%" },
  { day: "MON", height: "40%" },
  { day: "TUE", height: "46%" },
  { day: "WED", height: "84%", active: true },
  { day: "THU", height: "52%", muted: true },
  { day: "FRI", height: "51%", muted: true },
];

export default function StudyStatistics() {
  return (
    <article className="study-statistics-card">
      <div className="study-statistics-card__header">
        <h3 className="study-statistics-card__title">Study Statistics</h3>

        <div className="study-statistics-card__period-toggle">
          <button className="study-statistics-card__period study-statistics-card__period--active">
            week
          </button>
          <button className="study-statistics-card__period">month</button>
        </div>
      </div>

      <div className="study-statistics-card__chart">
        {chartBars.map((bar) => (
          <div className="study-statistics-card__column" key={bar.day}>
            <div className="study-statistics-card__bar-track">
              <div
                className={[
                  "study-statistics-card__bar",
                  bar.active ? "study-statistics-card__bar--active" : "",
                  bar.muted ? "study-statistics-card__bar--muted" : "",
                ]
                  .join(" ")
                  .trim()}
                style={{ height: bar.height }}
              />
            </div>
            <span className="study-statistics-card__day">{bar.day}</span>
          </div>
        ))}
      </div>
    </article>
  );
}