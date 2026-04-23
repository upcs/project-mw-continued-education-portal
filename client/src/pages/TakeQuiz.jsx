import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/take-quiz.css";
import {
  getTakeQuiz,
  startQuizAttempt,
  submitQuizAttempt,
  reportQuizViolation,
} from "../api/quizzes";

export default function TakeQuiz() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [violationCount, setViolationCount] = useState(0);

  const alreadyLocked = useMemo(() => {
    const lockedUntil = quizData?.latestAttempt?.locked_until;
    if (!lockedUntil) return false;
    return new Date(lockedUntil).getTime() > Date.now();
  }, [quizData]);

  const submittingRef = useRef(false);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await getTakeQuiz(moduleId);
      if (!data?.success) {
        throw new Error(data?.message || "Failed to load quiz");
      }

      setQuizData(data.data);
    } catch (err) {
      console.error("LOAD TAKE QUIZ ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  const requestFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.error("FULLSCREEN REQUEST ERROR:", err);
    }
  };

  const handleStartQuiz = async () => {
    try {
      setStarting(true);
      setError("");
      setMessage("");

      const { data } = await startQuizAttempt(moduleId);
      if (!data?.success) {
        throw new Error(data?.message || "Failed to start quiz");
      }

      setAttemptId(data.attemptId);
      setMessage("Quiz started. Stay on this screen until submission.");
      await requestFullscreen();
    } catch (err) {
      console.error("START QUIZ ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to start quiz");
    } finally {
      setStarting(false);
    }
  };

  const buildAnswersPayload = () => {
    const questions = quizData?.questions || [];
    return questions.map((question) => {
      const value = answers[question.id];

      if (question.question_type === "fill_blank") {
        return {
          question_id: question.id,
          answer_text: value || "",
        };
      }

      return {
        question_id: question.id,
        selected_choice_id: value ? Number(value) : null,
      };
    });
  };

  const handleSubmitQuiz = async () => {
    if (!attemptId || submittingRef.current) return;

    try {
      submittingRef.current = true;
      setSubmitting(true);
      setError("");
      setMessage("");

      const payload = { answers: buildAnswersPayload() };
      const { data } = await submitQuizAttempt(attemptId, payload);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to submit quiz");
      }

      setResult(data.data);
      setMessage("Quiz submitted successfully.");
    } catch (err) {
      console.error("SUBMIT QUIZ ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    }
  };

  useEffect(() => {
    if (!attemptId || result) return;

    const handleViolation = async () => {
      try {
        const { data } = await reportQuizViolation(attemptId);
        if (!data?.success) return;

        setViolationCount(data.violationCount || 0);

        if (data.shouldAutoSubmit) {
          await handleSubmitQuiz();
        }
      } catch (err) {
        console.error("QUIZ VIOLATION ERROR:", err);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !result) {
        handleViolation();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [attemptId, result]);

  if (loading) {
    return <section className="take-quiz-page">Loading quiz...</section>;
  }

  if (error && !quizData) {
    return <section className="take-quiz-page">{error}</section>;
  }

  const quiz = quizData?.quiz;
  const questions = quizData?.questions || [];

  return (
    <section className="take-quiz-page">
      <header className="take-quiz-page__header">
        <div>
          <h1>{quiz?.title || "Take Quiz"}</h1>
          <p>{quiz?.instructions || "Answer all questions and submit."}</p>
        </div>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      {message && <p className="take-quiz__message">{message}</p>}
      {error && <p className="take-quiz__error">{error}</p>}

      {alreadyLocked && !attemptId && !result && (
        <div className="take-quiz-card">
          <h2>Quiz Locked</h2>
          <p>
            You can retake this quiz after{" "}
            {new Date(quizData.latestAttempt.locked_until).toLocaleString()}.
          </p>
        </div>
      )}

      {!alreadyLocked && !attemptId && !result && (
        <div className="take-quiz-card">
          <h2>Ready to Start</h2>
          <p>Total points: {quiz?.total_points || 0}</p>
          <p>Pass percentage: {quiz?.pass_percentage || 70}%</p>
          <button type="button" onClick={handleStartQuiz} disabled={starting}>
            {starting ? "Starting..." : "Take Quiz"}
          </button>
        </div>
      )}

      {attemptId && !result && (
        <>
          <div className="take-quiz-card">
            <strong>Warning:</strong> Leaving fullscreen or switching tabs may submit your quiz automatically.
            <div>Violations: {violationCount}</div>
          </div>

          <form
            className="take-quiz-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitQuiz();
            }}
          >
            {questions.map((question, index) => (
              <div key={question.id} className="take-quiz-question-card">
                <h3>
                  {index + 1}. {question.prompt}
                </h3>
                <p>{question.points} point(s)</p>

                {question.question_type === "fill_blank" ? (
                  <input
                    type="text"
                    value={answers[question.id] || ""}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: e.target.value,
                      }))
                    }
                  />
                ) : (
                  <div className="take-quiz-choices">
                    {(question.choices || []).map((choice) => (
                      <label key={choice.id}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={Number(answers[question.id]) === Number(choice.id)}
                          onChange={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              [question.id]: choice.id,
                            }))
                          }
                        />
                        {choice.choice_text}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <button type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        </>
      )}

      {result && (
        <div className="take-quiz-card">
          <h2>Quiz Result</h2>
          <p>
            Score: {result.earned_points} / {result.total_points}
          </p>
          <p>Percentage: {Number(result.percentage || 0).toFixed(2)}%</p>
          <p>Status: {result.passed ? "Passed" : "Failed"}</p>
          <p>
            Quiz locked until: {new Date(result.locked_until).toLocaleString()}
          </p>
        </div>
      )}
    </section>
  );
}