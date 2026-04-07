import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import OverviewStats from "../components/dashboard/OverviewStats";
import StudyStatistics from "../components/dashboard/StudyStatistics";
import ProgressCard from "../components/dashboard/ProgressCard";
import LiveEventsCard from "../components/dashboard/LiveEventsCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import MyCourseCard from "../components/dashboard/MyCourseCard";
import API from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoadingCourses(true);
        setCoursesError("");

        const response = await API.get("/courses/enrolled");
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Failed to fetch enrolled courses");
        }

        setCourses(result.data || []);
      } catch (err) {
        setCoursesError(err.message || "Something went wrong");
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const cardThemes = [
    {
      surfaceClass: "dashboard-course-card--lavender",
      progressClass: "dashboard-course-card__progress--purple",
    },
    {
      surfaceClass: "dashboard-course-card--blue",
      progressClass: "dashboard-course-card__progress--blue",
    },
    {
      surfaceClass: "dashboard-course-card--cyan",
      progressClass: "dashboard-course-card__progress--cyan",
    },
  ];

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

            {loadingCourses && <p>Loading courses...</p>}
            {coursesError && <p>{coursesError}</p>}
            {!loadingCourses && !coursesError && courses.length === 0 && (
              <p>No enrolled courses found.</p>
            )}

            <div className="dashboard-course-grid">
              {courses.slice(0, 3).map((course, index) => {
                const theme = cardThemes[index % cardThemes.length];

                return (
                  <MyCourseCard
                    key={course.id}
                    title={course.title}
                    author={course.instructor}
                    progress={course.progress}
                    surfaceClass={theme.surfaceClass}
                    progressClass={theme.progressClass}
                    onClick={() => navigate(`/course-details/${course.id}`)}
                  />
                );
              })}
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