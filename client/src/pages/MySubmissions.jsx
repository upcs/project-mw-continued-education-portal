import { useEffect, useState } from "react";
import { getMySubmissions } from "../api/submissions";
import "../css/my-submissions.css";

export default function MySubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await getMySubmissions();
        setSubmissions(data?.data || []);
      } catch (err) {
        console.error("MY SUBMISSIONS ERROR:", err);
        setError(err?.response?.data?.message || "Failed to load submissions.");
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  if (loading) {
    return <div className="my-submissions-page">Loading submissions...</div>;
  }

  if (error) {
    return <div className="my-submissions-page">{error}</div>;
  }

  return (
    <div className="my-submissions-page">
      <div className="my-submissions-page__header">
        <h1>My Quiz Submissions</h1>
        <p>Track your quiz status, grades, and trainer feedback.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="my-submission-card">
          <p>No submissions yet.</p>
        </div>
      ) : (
        <div className="my-submissions-list">
          {submissions.map((item) => (
            <div key={item.id} className="my-submission-card">
              <div className="my-submission-card__top">
                <div>
                  <h3>{item.course_title || `Course #${item.course_id}`}</h3>
                  <p className="my-submission-card__meta">
                    <strong>Quiz:</strong> {item.module_title || `Module #${item.module_id}`}
                  </p>
                  <p className="my-submission-card__meta">
                    <strong>Submitted:</strong> {item.created_at || "N/A"}
                  </p>
                </div>

                <span
                  className={`my-submission-card__status my-submission-card__status--${
                    item.status || "submitted"
                  }`}
                >
                  {item.status || "submitted"}
                </span>
              </div>

              <div className="my-submission-card__section">
                <p>
                  <strong>Grade:</strong> {item.grade || "Not graded yet"}
                </p>
                <p>
                  <strong>Feedback:</strong> {item.feedback || "No feedback yet"}
                </p>
              </div>

              {item.answer_text && (
                <div className="my-submission-card__section">
                  <strong>Your Answer:</strong>
                  <p>{item.answer_text}</p>
                </div>
              )}

              {item.file_url && (
                <div className="my-submission-card__section">
                  <a href={item.file_url} target="_blank" rel="noreferrer">
                    View Uploaded File
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}