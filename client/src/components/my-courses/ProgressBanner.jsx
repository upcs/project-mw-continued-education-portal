import "../../css/progress-banner.css";
export default function ProgressBanner() {
  return (
    <div className="progress-banner">
      <p className="progress-banner__label">Progress</p>

      <div className="progress-banner__box">
        <div className="progress-banner__bar">
          <div className="progress-banner__fill" />
        </div>

        <span className="progress-banner__percent">30%</span>
      </div>
    </div>
  );
}