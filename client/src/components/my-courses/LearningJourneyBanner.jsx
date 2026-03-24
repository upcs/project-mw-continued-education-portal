export default function LearningJourneyBanner() {
  return (
    <article className="learning-journey-banner">
      <div className="learning-journey-banner__sky-cloud learning-journey-banner__sky-cloud--one">
        ☁️
      </div>
      <div className="learning-journey-banner__sky-cloud learning-journey-banner__sky-cloud--two">
        ☁️
      </div>

      <div className="learning-journey-banner__tree learning-journey-banner__tree--one">
        🌳
      </div>
      <div className="learning-journey-banner__tree learning-journey-banner__tree--two">
        🌳
      </div>
      <div className="learning-journey-banner__tree learning-journey-banner__tree--three">
        🌳
      </div>

      <div className="learning-journey-banner__track" />
      <div className="learning-journey-banner__climber">🧗</div>
      <div className="learning-journey-banner__progress-tag">30%</div>

      <div className="learning-journey-banner__trophy">🏆</div>
      <div className="learning-journey-banner__level-label">Beginner</div>
    </article>
  );
}