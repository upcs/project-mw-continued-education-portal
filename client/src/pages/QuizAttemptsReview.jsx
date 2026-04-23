import { useEffect, useState } from "react";
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
      setError(err?.response?.data?.message || err.message || "Failed to load quiz attempts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
  }, [moduleId]);

  if (loading) {
    return <section className="quiz-review-page">Loading attempts...</section>;
  }

  return (
    <section className="quiz-review-page">
      <header className="quiz-review-page__header">
        <h1>Quiz Review</h1>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      {error && <p>{error}</p>}

      {attempts.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        <table className="quiz-review-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Started</th>
              <th>Submitted</th>
              <th>Score</th>
              <th>Percent</th>
              <th>Passed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((attempt) => (
              <tr key={attempt.id}>
                <td>{attempt.fullname || "—"}</td>
                <td>{attempt.user_email}</td>
                <td>{attempt.started_at ? new Date(attempt.started_at).toLocaleString() : "—"}</td>
                <td>{attempt.submitted_at ? new Date(attempt.submitted_at).toLocaleString() : "—"}</td>
                <td>{attempt.earned_points} / {attempt.total_points}</td>
                <td>{Number(attempt.percentage || 0).toFixed(2)}%</td>
                <td>{attempt.passed ? "Yes" : "No"}</td>
                <td>{attempt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}