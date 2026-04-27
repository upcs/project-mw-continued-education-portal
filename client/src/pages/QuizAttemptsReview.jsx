import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/quiz-attempts-review.css";
import { getQuizAttemptsForReview } from "../api/quizzes";

export default function QuizAttemptsReview() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAttempts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getQuizAttemptsForReview(moduleId);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load quiz attempts");
      }

      setAttempts(data.data || []);
    } catch (err) {
      console.error("LOAD QUIZ ATTEMPTS ERROR:", err);
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load quiz attempts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [moduleId]);

  const summary = useMemo(() => {
    const total = attempts.length;
    const passed = attempts.filter((attempt) => attempt.passed).length;
    const submitted = attempts.filter((attempt) => attempt.submitted_at).length;

    return { total, passed, submitted };
  }, [attempts]);

  if (loading) {
    return <section className="quiz-review-page">Loading attempts...</section>;
  }

  return (
    <section className="quiz-review-page">
      <header className="quiz-review-page__header">
        <div>
          <h1>Quiz Review</h1>
          <p>Review student quiz attempts and results.</p>
        </div>

        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      {error && <p className="quiz-review-error">{error}</p>}

      <div className="quiz-review-summary">
        <div className="quiz-review-stat">
          <p>Total Attempts</p>
          <h3>{summary.total}</h3>
        </div>

        <div className="quiz-review-stat">
          <p>Submitted</p>
          <h3>{summary.submitted}</h3>
        </div>

        <div className="quiz-review-stat">
          <p>Passed</p>
          <h3>{summary.passed}</h3>
        </div>
      </div>

      {attempts.length === 0 ? (
        <p className="quiz-review-empty">No attempts yet.</p>
      ) : (
        <div className="quiz-review-table-wrap">
          <table className="quiz-review-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Started</th>
                <th>Submitted</th>
                <th>Score</th>
                <th>Percent</th>
                <th>Result</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attempts.map((attempt) => {
                const percentage = Number(attempt.percentage || 0).toFixed(2);

                return (
                  <tr key={attempt.id}>
                    <td>{attempt.fullname || "—"}</td>
                    <td>{attempt.user_email}</td>
                    <td>
                      {attempt.started_at
                        ? new Date(attempt.started_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {attempt.submitted_at
                        ? new Date(attempt.submitted_at).toLocaleString()
                        : "—"}
                    </td>
                    <td>
                      {attempt.earned_points || 0} / {attempt.total_points || 0}
                    </td>
                    <td>{percentage}%</td>
                    <td>
                      <span
                        className={
                          attempt.passed
                            ? "quiz-review-pill quiz-review-pill--pass"
                            : "quiz-review-pill quiz-review-pill--fail"
                        }
                      >
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td>
                      <span className="quiz-review-pill quiz-review-pill--status">
                        {attempt.status || "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}