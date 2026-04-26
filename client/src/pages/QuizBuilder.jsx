import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/quiz-builder.css";
import {
  createOrLoadQuizBuilder,
  getQuizBuilder,
  updateQuizDefinition,
  addQuizQuestion,
  deleteQuizQuestion,
} from "../api/quizzes";

const emptyChoice = (index) => ({
  choice_text: "",
  is_correct: false,
  sort_order: index + 1,
});

export default function QuizBuilder() {
  const { moduleId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [builderForm, setBuilderForm] = useState({
    title: "",
    instructions: "",
    pass_percentage: 70,
    time_limit_minutes: "",
    is_published: false,
  });

  const [questionForm, setQuestionForm] = useState({
    question_type: "multiple_choice",
    prompt: "",
    points: 1,
    correct_text: "",
    choices: [emptyChoice(0), emptyChoice(1)],
  });

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      await createOrLoadQuizBuilder(moduleId);
      const { data } = await getQuizBuilder(moduleId);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to load quiz builder");
      }

      const quizData = data.data.quiz;
      setQuiz(quizData);
      setQuestions(data.data.questions || []);
      setBuilderForm({
        title: quizData.title || "",
        instructions: quizData.instructions || "",
        pass_percentage: Number(quizData.pass_percentage || 70),
        time_limit_minutes: quizData.time_limit_minutes || "",
        is_published: Boolean(quizData.is_published),
      });
    } catch (err) {
      console.error("QUIZ BUILDER LOAD ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to load quiz builder");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
  }, [moduleId]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!quiz?.id) return;

    try {
      setSavingSettings(true);
      setError("");
      setMessage("");

      const { data } = await updateQuizDefinition(quiz.id, builderForm);
      if (!data?.success) {
        throw new Error(data?.message || "Failed to save quiz settings");
      }

      setMessage("Quiz settings saved.");
      await loadQuiz();
    } catch (err) {
      console.error("SAVE QUIZ SETTINGS ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to save quiz settings");
    } finally {
      setSavingSettings(false);
    }
  };

  const handleQuestionTypeChange = (type) => {
    setQuestionForm({
      question_type: type,
      prompt: "",
      points: 1,
      correct_text: "",
      choices:
        type === "fill_blank"
          ? []
          : type === "true_false"
          ? [
              { choice_text: "True", is_correct: true, sort_order: 1 },
              { choice_text: "False", is_correct: false, sort_order: 2 },
            ]
          : [emptyChoice(0), emptyChoice(1)],
    });
  };

  const handleChoiceChange = (index, field, value) => {
    setQuestionForm((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) =>
        i === index ? { ...choice, [field]: value } : choice
      ),
    }));
  };

  const handleCorrectChoice = (index) => {
    setQuestionForm((prev) => ({
      ...prev,
      choices: prev.choices.map((choice, i) => ({
        ...choice,
        is_correct: i === index,
      })),
    }));
  };

  const handleAddChoice = () => {
    setQuestionForm((prev) => ({
      ...prev,
      choices: [...prev.choices, emptyChoice(prev.choices.length)],
    }));
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!quiz?.id) return;

    try {
      setError("");
      setMessage("");

      const payload = {
        ...questionForm,
        points: Number(questionForm.points || 1),
        choices: questionForm.question_type === "fill_blank" ? [] : questionForm.choices,
      };

      const { data } = await addQuizQuestion(quiz.id, payload);
      if (!data?.success) {
        throw new Error(data?.message || "Failed to add question");
      }

      setMessage("Question added.");
      handleQuestionTypeChange("multiple_choice");
      await loadQuiz();
    } catch (err) {
      console.error("ADD QUIZ QUESTION ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to add question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    const confirmed = window.confirm("Delete this question?");
    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const { data } = await deleteQuizQuestion(questionId);
      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete question");
      }

      setMessage("Question deleted.");
      await loadQuiz();
    } catch (err) {
      console.error("DELETE QUIZ QUESTION ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Failed to delete question");
    }
  };

  if (loading) {
    return <section className="quiz-builder-page">Loading quiz builder...</section>;
  }

  return (
    <section className="quiz-builder-page">
      <header className="quiz-builder-page__header">
        <div>
          <h1>Quiz Builder</h1>
          <p>Create quiz questions, scoring, and pass rules.</p>
        </div>
        <button type="button" onClick={() => navigate(-1)}>
          Back
        </button>
      </header>

      {message && <p className="quiz-builder__message">{message}</p>}
      {error && <p className="quiz-builder__error">{error}</p>}

      <div className="quiz-builder-grid">
        <section className="quiz-builder-card">
          <h2>Quiz Settings</h2>

          <form onSubmit={handleSaveSettings} className="quiz-builder-form">
            <input
              type="text"
              placeholder="Quiz title"
              value={builderForm.title}
              onChange={(e) => setBuilderForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            <textarea
              placeholder="Instructions"
              value={builderForm.instructions}
              onChange={(e) => setBuilderForm((prev) => ({ ...prev, instructions: e.target.value }))}
            />

            <input
              type="number"
              min="0"
              max="100"
              placeholder="Pass percentage"
              value={builderForm.pass_percentage}
              onChange={(e) =>
                setBuilderForm((prev) => ({
                  ...prev,
                  pass_percentage: Number(e.target.value || 70),
                }))
              }
            />

            <input
              type="number"
              min="1"
              placeholder="Time limit in minutes (optional)"
              value={builderForm.time_limit_minutes}
              onChange={(e) =>
                setBuilderForm((prev) => ({
                  ...prev,
                  time_limit_minutes: e.target.value,
                }))
              }
            />

            <label>
              <input
                type="checkbox"
                checked={builderForm.is_published}
                onChange={async (e) => {
                  const newValue = e.target.checked;

                  const updated = {
                    ...builderForm,
                    is_published: newValue,
                  };

                  setBuilderForm(updated);

                  try {
                    setSavingSettings(true);
                    setError("");
                    setMessage("");

                    const { data } = await updateQuizDefinition(quiz.id, updated);

                    if (!data?.success) {
                      throw new Error(data?.message || "Failed to update publish status");
                    }

                    setMessage(newValue ? "Quiz published." : "Quiz unpublished.");
                    await loadQuiz();
                  } catch (err) {
                    console.error("PUBLISH QUIZ ERROR:", err);
                    setError(
                      err?.response?.data?.message ||
                        err.message ||
                        "Failed to update publish status"
                    );
                  } finally {
                    setSavingSettings(false);
                  }
                }}
              />
              Published
            </label>

            <p>Total points: {quiz?.total_points || 0}</p>

            <button type="submit" disabled={savingSettings}>
              {savingSettings ? "Saving..." : "Save Settings"}
            </button>
          </form>
        </section>

        <section className="quiz-builder-card">
          <h2>Add Question</h2>

          <form onSubmit={handleCreateQuestion} className="quiz-builder-form">
            <select
              value={questionForm.question_type}
              onChange={(e) => handleQuestionTypeChange(e.target.value)}
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True / False</option>
              <option value="fill_blank">Fill in the Blank</option>
            </select>

            <textarea
              placeholder="Question prompt"
              value={questionForm.prompt}
              onChange={(e) =>
                setQuestionForm((prev) => ({ ...prev, prompt: e.target.value }))
              }
            />

            <input
              type="number"
              min="0"
              step="0.5"
              placeholder="Points"
              value={questionForm.points}
              onChange={(e) =>
                setQuestionForm((prev) => ({
                  ...prev,
                  points: e.target.value,
                }))
              }
            />

            {questionForm.question_type === "fill_blank" ? (
              <input
                type="text"
                placeholder="Correct answer"
                value={questionForm.correct_text}
                onChange={(e) =>
                  setQuestionForm((prev) => ({
                    ...prev,
                    correct_text: e.target.value,
                  }))
                }
              />
            ) : (
              <div className="quiz-builder-choices">
                {questionForm.choices.map((choice, index) => (
                  <div key={index} className="quiz-builder-choice-row">
                    <input
                      type="text"
                      placeholder={`Choice ${index + 1}`}
                      value={choice.choice_text}
                      disabled={questionForm.question_type === "true_false"}
                      onChange={(e) =>
                        handleChoiceChange(index, "choice_text", e.target.value)
                      }
                    />
                    <label>
                      <input
                        type="radio"
                        checked={choice.is_correct}
                        onChange={() => handleCorrectChoice(index)}
                      />
                      Correct
                    </label>
                  </div>
                ))}

                {questionForm.question_type === "multiple_choice" && (
                  <button type="button" onClick={handleAddChoice}>
                    Add Choice
                  </button>
                )}
              </div>
            )}

            <button type="submit">Add Question</button>
          </form>
        </section>
      </div>

      <section className="quiz-builder-card">
        <h2>Questions</h2>

        {questions.length === 0 ? (
          <p>No questions yet.</p>
        ) : (
          <div className="quiz-builder-question-list">
            {questions.map((question) => (
              <div key={question.id} className="quiz-builder-question-card">
                <div>
                  <strong>{question.prompt}</strong>
                  <p>
                    {question.question_type} • {question.points} point(s)
                  </p>
                  {question.question_type === "fill_blank" ? (
                    <p>Correct answer: {question.correct_text || "—"}</p>
                  ) : (
                    <ul>
                      {(question.choices || []).map((choice) => (
                        <li key={choice.id}>
                          {choice.choice_text} {choice.is_correct ? "✓" : ""}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <button type="button" onClick={() => handleDeleteQuestion(question.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}