import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import LiveEventsCard from "../components/dashboard/LiveEventsCard";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import MyCourseCard from "../components/dashboard/MyCourseCard";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { getEducatorStats, getTrainerStats } from "../api/dashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        setCoursesError("");

        const { data } = await API.get("/courses/enrolled");

        if (!data?.success) {
          throw new Error(data?.message || "Failed to load courses");
        }

        setCourses(data.data || []);
      } catch (err) {
        console.error("DASHBOARD COURSES ERROR:", err);
        setCoursesError(
          err?.response?.data?.message || err.message || "Failed to load courses"
        );
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        setStatsError("");

        if (user?.role === "educator") {
          const { data } = await getEducatorStats();

          if (!data?.success) {
            throw new Error(data?.message || "Failed to load stats");
          }

          setStats(data.data || null);
        } else if (user?.role === "trainer" || user?.role === "admin") {
          const { data } = await getTrainerStats();

          if (!data?.success) {
            throw new Error(data?.message || "Failed to load stats");
          }

          setStats(data.data || null);
        } else {
          setStats(null);
        }
      } catch (err) {
        console.error("DASHBOARD STATS ERROR:", err);
        setStatsError(
          err?.response?.data?.message || err.message || "Failed to load stats"
        );
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.role) {
      fetchStats();
    } else {
      setLoadingStats(false);
    }
  }, [user]);

  const handlePendingReviewsClick = () => {
    if (stats?.defaultPendingCourseId) {
      navigate(`/course-submissions/${stats.defaultPendingCourseId}?status=submitted`);
    }
  };

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <h1 className="dashboard-page__title">Dashboard</h1>
      </header>

      <div className="dashboard-page__content">
        <div className="dashboard-page__main">
          <section className="dashboard-section">
            <h2 className="dashboard-section__title">Overview</h2>

            {loadingStats && <p>Loading stats...</p>}
            {statsError && <p>{statsError}</p>}

            {stats && (
              <div className="dashboard-stats-grid">
                {user?.role === "educator" && (
                  <>
                    <StatCard
                      title="Completion"
                      value={`${stats.completionPercentage || 0}%`}
                      subtitle="Quiz completion progress"
                    />
                    <StatCard
                      title="Avg Grade"
                      value={stats.averageGrade || "0.00"}
                      subtitle="Based on graded submissions"
                    />
                    <StatCard
                      title="Submissions"
                      value={stats.submittedQuizzes || 0}
                      subtitle={`Out of ${stats.totalQuizzes || 0} total quizzes`}
                    />

                    {stats.latestSubmission && (
                      <StatCard
                        title="Latest Submission"
                        value={stats.latestSubmission.status || "submitted"}
                        subtitle={`${stats.latestSubmission.course_title || "Course"} • ${
                          stats.latestSubmission.module_title || "Quiz"
                        }`}
                      />
                    )}
                  </>
                )}

                {(user?.role === "trainer" || user?.role === "admin") && (
                  <StatCard
                    title="Pending Reviews"
                    value={stats.pendingReviews || 0}
                    subtitle={
                      stats.defaultPendingCourseId
                        ? "Click to review submitted quizzes"
                        : "No pending quiz reviews"
                    }
                    onClick={
                      stats.defaultPendingCourseId ? handlePendingReviewsClick : undefined
                    }
                  />
                )}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h2 className="dashboard-section__title">My Courses</h2>

            {loadingCourses && <p>Loading...</p>}
            {coursesError && <p>{coursesError}</p>}
            {!loadingCourses && !coursesError && courses.length === 0 && (
              <p>No courses</p>
            )}

            <div className="dashboard-course-grid">
              {courses.map((course) => (
                <MyCourseCard
                  key={course.id}
                  title={course.title}
                  author={course.instructor}
                  progress={course.progress}
                  onClick={() => navigate(`/course-details/${course.id}`)}
                />
              ))}
            </div>
          </section>
        </div>

        <aside className="dashboard-page__sidebar">
          <LiveEventsCard />
          <ActivityFeed />
        </aside>
      </div>
    </section>
  );
}

function StatCard({ title, value, subtitle, onClick }) {
  const handleKeyDown = (event) => {
    if (!onClick) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`dashboard-stat-card ${
        onClick ? "dashboard-stat-card--clickable" : ""
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <p className="dashboard-stat-card__title">{title}</p>
      <h2 className="dashboard-stat-card__value">{value}</h2>
      {subtitle && <p className="dashboard-stat-card__subtitle">{subtitle}</p>}
    </div>
  );
}