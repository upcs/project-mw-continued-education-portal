import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCourseSubmissions, gradeSubmission } from "../api/submissions";
import "../css/course-submissions.css";

export default function CourseSubmissions() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getCourseSubmissions(id);
      setSubmissions(data?.data || []);
    } catch (err) {
      console.error("LOAD COURSE SUBMISSIONS ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [id]);

  const handleGrade = async (submissionId, payload) => {
    try {
      await gradeSubmission(submissionId, payload);
      await loadSubmissions();
      return { success: true };
    } catch (err) {
      console.error("SAVE GRADE ERROR:", err);
      return {
        success: false,
        message: err?.response?.data?.message || "Failed to save review.",
      };
    }
  };

  if (loading) return <div className="course-submissions-page">Loading submissions...</div>;
  if (error) return <div className="course-submissions-page">{error}</div>;

  return (
    <div className="course-submissions-page">
      <div className="course-submissions-page__header">
        <h1>Course Submissions</h1>
        <p>Review educator quiz submissions, assign grades, and leave feedback.</p>
      </div>

      {submissions.length === 0 ? (
        <div className="submission-review-card">
          <p>No submissions found.</p>
        </div>
      ) : (
        <div className="course-submissions-page__list">
          {submissions.map((item) => (
            <SubmissionReviewCard
              key={item.id}
              submission={item}
              onSave={handleGrade}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SubmissionReviewCard({ submission, onSave }) {
  const [status, setStatus] = useState(submission.status || "submitted");
  const [grade, setGrade] = useState(submission.grade || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const result = await onSave(submission.id, {
        status,
        grade,
        feedback,
      });

      if (result?.success) {
        setMessage("Review saved successfully.");
      } else {
        setError(result?.message || "Failed to save review.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="submission-review-card">
      <div className="submission-review-card__top">
        <div>
          <h3>{submission.module_title || "Quiz Submission"}</h3>
          <p className="submission-review-card__meta">
            <strong>Course:</strong> {submission.course_title || `Course #${submission.course_id}`}
          </p>
          <p className="submission-review-card__meta">
            <strong>Educator:</strong> {submission.user_email}
          </p>
          <p className="submission-review-card__meta">
            <strong>Submitted:</strong> {submission.created_at || "N/A"}
          </p>
        </div>

        <span className={`submission-review-card__status submission-review-card__status--${status}`}>
          {status}
        </span>
      </div>

      <div className="submission-review-card__section">
        <strong>Answer:</strong>
        <p>{submission.answer_text || "No text answer provided."}</p>
      </div>

      {submission.file_url && (
        <div className="submission-review-card__section">
          <a href={submission.file_url} target="_blank" rel="noreferrer">
            View uploaded file
          </a>
        </div>
      )}

      <div className="submission-review-card__form">
        <div className="submission-review-card__field">
          <label>Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="submission-review-card__field">
          <label>Grade</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="e.g. 85, A, Pass"
          />
        </div>

        <div className="submission-review-card__field">
          <label>Feedback</label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter feedback"
          />
        </div>
      </div>

      {message && <p className="submission-review-card__success">{message}</p>}
      {error && <p className="submission-review-card__error">{error}</p>}

      <button
        type="button"
        className="submission-review-card__button"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Review"}
      </button>
    </div>
  );
}