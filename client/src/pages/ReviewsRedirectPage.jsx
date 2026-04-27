import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainerStats } from "../api/dashboard";
import "../css/review-page.css";

export default function ReviewsRedirectPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({
    pendingReviews: 0,
    topPendingCourses: [],
    defaultPendingCourseId: null,
  });

  const loadReviewsData = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getTrainerStats();

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load reviews.");
      }

      setSummary({
        pendingReviews: data?.data?.pendingReviews || 0,
        topPendingCourses: data?.data?.topPendingCourses || [],
        defaultPendingCourseId: data?.data?.defaultPendingCourseId || null,
      });
    } catch (err) {
      console.error("REVIEWS PAGE ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to load reviews."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, []);

  const handleOpenCourseReviews = (courseId) => {
    if (!courseId) return;
    navigate(`/course-submissions/${courseId}?status=submitted`);
  };

  return (
    <section className="reviews-page">
      <header className="reviews-page__header">
        <div>
          <h1 className="reviews-page__title">Reviews</h1>
          <p className="reviews-page__subtitle">
            Review submitted quizzes and manage pending course submissions.
          </p>
        </div>

        <button
          type="button"
          className="reviews-page__refresh"
          onClick={loadReviewsData}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      {error && <p className="reviews-page__error">{error}</p>}

      <div className="reviews-page__summary">
        <div className="reviews-stat-card">
          <p className="reviews-stat-card__label">Pending Reviews</p>
          <h2 className="reviews-stat-card__value">
            {loading ? "..." : summary.pendingReviews}
          </h2>
          <p className="reviews-stat-card__hint">
            Total latest quiz submissions awaiting review
          </p>
        </div>

        <div className="reviews-stat-card">
          <p className="reviews-stat-card__label">Priority Course</p>
          <h2 className="reviews-stat-card__value">
            {loading
              ? "..."
              : summary.topPendingCourses?.[0]?.course_title || "None"}
          </h2>
          <p className="reviews-stat-card__hint">
            {loading
              ? "Loading..."
              : summary.topPendingCourses?.[0]
              ? `${summary.topPendingCourses[0].pendingCount} pending submission(s)`
              : "No pending reviews right now"}
          </p>
        </div>
      </div>

      <section className="reviews-panel">
        <div className="reviews-panel__header">
          <h2 className="reviews-panel__title">Courses with Pending Reviews</h2>
          {!!summary.defaultPendingCourseId && !loading && (
            <button
              type="button"
              className="reviews-panel__primary-btn"
              onClick={() =>
                handleOpenCourseReviews(summary.defaultPendingCourseId)
              }
            >
              Open Next Review Queue
            </button>
          )}
        </div>

        {loading ? (
          <p className="reviews-panel__empty">Loading review queues...</p>
        ) : summary.topPendingCourses.length === 0 ? (
          <div className="reviews-empty-state">
            <h3>No pending reviews</h3>
            <p>
              All latest quiz submissions have been reviewed. Check back later.
            </p>
          </div>
        ) : (
          <div className="reviews-table-wrap">
            <table className="reviews-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Pending Submissions</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.topPendingCourses.map((course) => (
                  <tr key={course.course_id}>
                    <td>{course.course_title || `Course #${course.course_id}`}</td>
                    <td>{course.pendingCount || 0}</td>
                    <td>
                      <div className="reviews-table__actions">
                        <button
                          type="button"
                          className="reviews-table__action"
                          onClick={() =>
                            handleOpenCourseReviews(course.course_id)
                          }
                        >
                          Submissions
                        </button>

                        <button
                          type="button"
                          className="reviews-table__action reviews-table__action--secondary"
                          onClick={() =>
                            navigate(`/course-details/${course.course_id}`)
                          }
                        >
                          Open Course
                        </button>

                        {course.module_id && (
                          <button
                            type="button"
                            className="reviews-table__action reviews-table__action--primary"
                            onClick={() =>
                              navigate(`/quiz-review/${course.module_id}`)
                            }
                          >
                            Quiz Review
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}