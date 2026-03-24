import "../css/dashboard.css";
import OverviewStats from "../components/dashboard/OverviewStats";
import StudyStatistics from "../components/dashboard/StudyStatistics";
import ProgressCard from "../components/dashboard/ProgressCard";
import LiveEventsCard from "../components/dashboard/LiveEventsCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import MyCourseCard from "../components/dashboard/MyCourseCard";

export default function Dashboard() {
  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
      </header>

      <div className="dashboard-page__content">
        <div className="dashboard-page__main">
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Overview</h2>
            <OverviewStats />
          </section>

          <section className="dashboard-page__analytics">
            <StudyStatistics />
            <ProgressCard />
          </section>

          <section className="dashboard-section dashboard-section--courses">
            <h2 className="dashboard-section__title">My Courses</h2>

            <div className="dashboard-course-grid">
              <MyCourseCard
                title="Introduction to lorem ipsum..."
                author="Shams Tabrez"
                surfaceClass="dashboard-course-card--lavender"
                progressClass="dashboard-course-card__progress--purple"
              />
              <MyCourseCard
                title="English for today"
                author="Shams Tabrez"
                surfaceClass="dashboard-course-card--blue"
                progressClass="dashboard-course-card__progress--blue"
              />
              <MyCourseCard
                title="Basic of Lorem ipsum color..."
                author="Shams Tabrez"
                surfaceClass="dashboard-course-card--cyan"
                progressClass="dashboard-course-card__progress--cyan"
              />
            </div>
          </section>
        </div>

        <aside className="dashboard-page__sidebar">
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Live Events</h2>
            <LiveEventsCard />
          </section>

          <section className="dashboard-section dashboard-section--activity">
            <h2 className="dashboard-section__title">Activity</h2>
            <ActivityFeed />
          </section>
        </aside>
      </div>
    </section>
  );
}