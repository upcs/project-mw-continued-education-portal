import { useState } from "react";
import { submitQuiz } from "../../api/submissions";

export default function QuizSubmissionForm({ moduleId, onSubmitted }) {
  const [answerText, setAnswerText] = useState("");
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("answerText", answerText);
      if (submissionFile) {
        formData.append("submissionFile", submissionFile);
      }

      const { data } = await submitQuiz(moduleId, formData);

      if (data.success) {
        setMessage("Quiz submitted successfully.");
        setAnswerText("");
        setSubmissionFile(null);
        onSubmitted?.(data.data);
      } else {
        setError(data.message || "Failed to submit quiz.");
      }
    } catch (err) {
      console.error("QUIZ SUBMIT ERROR:", err);
      setError(err?.response?.data?.message || "Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quiz-submit-form">
      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        placeholder="Enter your answer"
        className="quiz-submit-form__textarea"
      />

      <input
        type="file"
        onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
      />

      {message && <p className="quiz-submit-form__success">{message}</p>}
      {error && <p className="quiz-submit-form__error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </form>
  );
}