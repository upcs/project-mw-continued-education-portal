export default function ProgressCard() {
  return (
    <article className="progress-summary-card">
      <h3 className="progress-summary-card__title">Progress</h3>

      <div className="progress-summary-card__ring-wrap">
        <div className="progress-summary-card__ring">
          <div className="progress-summary-card__inner">
            <p className="progress-summary-card__primary-value">45%</p>
            <p className="progress-summary-card__secondary-value">80%</p>
          </div>
        </div>
      </div>

      <div className="progress-summary-card__legend">
        <div className="progress-summary-card__legend-item">
          <span className="progress-summary-card__legend-dot progress-summary-card__legend-dot--dark" />
          <span>courses</span>
        </div>

        <div className="progress-summary-card__legend-item">
          <span className="progress-summary-card__legend-dot progress-summary-card__legend-dot--blue" />
          <span>Prototypes</span>
        </div>
      </div>
    </article>
  );
}