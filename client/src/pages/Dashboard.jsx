import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/dashboard.css";
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

  const isEducator = user?.role === "educator";
  const isTrainerOrAdmin = user?.role === "trainer" || user?.role === "admin";

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
          err?.response?.data?.message ||
            err.message ||
            "Failed to load courses"
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

        if (isEducator) {
          const { data } = await getEducatorStats();

          if (!data?.success) {
            throw new Error(data?.message || "Failed to load stats");
          }

          setStats(data.data || null);
          return;
        }

        if (isTrainerOrAdmin) {
          const { data } = await getTrainerStats();

          if (!data?.success) {
            throw new Error(data?.message || "Failed to load stats");
          }

          setStats(data.data || null);
          return;
        }

        setStats(null);
      } catch (err) {
        console.error("DASHBOARD STATS ERROR:", err);
        setStatsError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load stats"
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
  }, [user?.role, isEducator, isTrainerOrAdmin]);

  const handlePendingReviewsClick = () => {
    if (stats?.defaultPendingCourseId) {
      navigate(`/course-submissions/${stats.defaultPendingCourseId}?status=submitted`);
    } else {
      navigate("/courses");
    }
  };

  const courseSectionTitle =
    user?.role === "trainer"
      ? "Courses You Contributed To"
      : user?.role === "admin"
      ? "Platform Courses"
      : "My Courses";

  const emptyCoursesText =
    user?.role === "trainer"
      ? "You have not contributed to any courses yet."
      : "No courses found.";

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <p className="dashboard-page__eyebrow">
            Welcome back{user?.fullname ? `, ${user.fullname}` : ""}
          </p>
          <h1 className="dashboard-page__title">Dashboard</h1>
        </div>
      </header>

      <section className="dashboard-card">
        <div className="dashboard-card__header">
          <h2>Overview</h2>
          <p>
            {isEducator
              ? "Track your learning progress and latest quiz activity."
              : "Monitor reviews and course activity."}
          </p>
        </div>

        {loadingStats && <p className="dashboard-muted">Loading stats...</p>}
        {statsError && <p className="dashboard-error">{statsError}</p>}

        {!loadingStats && !statsError && (
          <div className="dashboard-stats-grid">
            {isEducator && (
              <>
                <StatCard
                  title="Completion"
                  value={`${stats?.completionPercentage || 0}%`}
                  subtitle="Quiz completion progress"
                />

                <StatCard
                  title="Average Grade"
                  value={stats?.averageGrade || "0.00"}
                  subtitle="Based on graded submissions"
                />

                <StatCard
                  title="Submissions"
                  value={stats?.submittedQuizzes || 0}
                  subtitle={`Out of ${stats?.totalQuizzes || 0} total quizzes`}
                />

                <StatCard
                  title="Latest"
                  value={stats?.latestSubmission?.status || "None"}
                  subtitle={
                    stats?.latestSubmission
                      ? `${stats.latestSubmission.course_title || "Course"} • ${
                          stats.latestSubmission.module_title || "Quiz"
                        }`
                      : "No submissions yet"
                  }
                />
              </>
            )}

            {isTrainerOrAdmin && (
              <>
                <StatCard
                  title="Pending Reviews"
                  value={stats?.pendingReviews || 0}
                  subtitle="Submissions waiting for review"
                  onClick={handlePendingReviewsClick}
                />

                <StatCard
                  title="Top Queue"
                  value={stats?.topPendingCourses?.[0]?.pendingCount || 0}
                  subtitle={
                    stats?.topPendingCourses?.[0]?.course_title ||
                    "No pending courses"
                  }
                />
              </>
            )}
          </div>
        )}
      </section>

      <section className="dashboard-card">
        <div className="dashboard-card__header dashboard-card__header--row">
          <div>
            <h2>{courseSectionTitle}</h2>
            <p>Open a course to continue learning or manage content.</p>
          </div>

          <button
            type="button"
            className="dashboard-link-btn"
            onClick={() => navigate("/courses")}
          >
            View Courses
          </button>
        </div>

        {loadingCourses && <p className="dashboard-muted">Loading courses...</p>}
        {coursesError && <p className="dashboard-error">{coursesError}</p>}

        {!loadingCourses && !coursesError && courses.length === 0 && (
          <p className="dashboard-muted">{emptyCoursesText}</p>
        )}

        {!loadingCourses && !coursesError && courses.length > 0 && (
          <div className="dashboard-course-grid">
            {courses.slice(0, 6).map((course) => (
              <MyCourseCard
                key={course.id}
                title={course.title}
                author={course.instructor}
                progress={course.progress}
                onClick={() => navigate(`/course-details/${course.id}`)}
              />
            ))}
          </div>
        )}
      </section>
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
