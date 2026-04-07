import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/course-details.css";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  getModuleSubmissions,
  getMySubmissions,
  submitQuiz,
} from "../api/submissions";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModuleId, setActiveModuleId] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemType, setNewItemType] = useState("lesson");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemContent, setNewItemContent] = useState("");
  const [newItemFile, setNewItemFile] = useState(null);
  const [addingItem, setAddingItem] = useState(false);
  const [addMessage, setAddMessage] = useState("");

  const [mySubmissions, setMySubmissions] = useState([]);
  const [moduleSubmissions, setModuleSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [quizAnswer, setQuizAnswer] = useState("");
  const [quizFile, setQuizFile] = useState(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizMessage, setQuizMessage] = useState("");
  const [quizError, setQuizError] = useState("");

  const isTrainerOrAdmin =
    user?.role === "admin" || user?.role === "trainer";
  const isEducator = user?.role === "educator";

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [courseRes, modulesRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get(`/courses/${id}/modules`),
      ]);

      if (!courseRes?.data?.success) {
        throw new Error(courseRes?.data?.message || "Failed to fetch course");
      }

      if (!modulesRes?.data?.success) {
        throw new Error(modulesRes?.data?.message || "Failed to fetch modules");
      }

      setCourse(courseRes.data.data);
      setModules(modulesRes.data.data || []);
    } catch (err) {
      console.error("COURSE DETAILS LOAD ERROR:", err);
      setError(err?.response?.data?.message || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const loadMySubmissions = async () => {
      if (!isEducator) return;

      try {
        const { data } = await getMySubmissions();
        setMySubmissions(data?.data || []);
      } catch (err) {
        console.error("MY SUBMISSIONS LOAD ERROR:", err);
      }
    };

    loadMySubmissions();
  }, [isEducator]);

  const activeModule = useMemo(() => {
    if (activeModuleId === "overview") return null;
    return modules.find((item) => item.id === activeModuleId) || null;
  }, [modules, activeModuleId]);

  const activeEducatorSubmission = useMemo(() => {
    if (!activeModule || !isEducator) return null;

    return (
      mySubmissions.find(
        (submission) => Number(submission.module_id) === Number(activeModule.id)
      ) || null
    );
  }, [activeModule, isEducator, mySubmissions]);

  useEffect(() => {
    const loadModuleSubmissionsForReview = async () => {
      if (!activeModule || activeModule.type !== "quiz" || !isTrainerOrAdmin) {
        setModuleSubmissions([]);
        return;
      }

      try {
        setLoadingSubmissions(true);
        const { data } = await getModuleSubmissions(activeModule.id);
        setModuleSubmissions(data?.data || []);
      } catch (err) {
        console.error("MODULE SUBMISSIONS LOAD ERROR:", err);
        setModuleSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    loadModuleSubmissionsForReview();
  }, [activeModule, isTrainerOrAdmin]);

  const openAddForm = (type) => {
    setShowAddForm(true);
    setNewItemType(type);
    setNewItemTitle("");
    setNewItemContent("");
    setNewItemFile(null);
    setAddMessage("");
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setNewItemTitle("");
    setNewItemContent("");
    setNewItemFile(null);
    setAddMessage("");
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddMessage("");

    if (!newItemTitle.trim()) {
      setAddMessage("Title is required.");
      return;
    }

    try {
      setAddingItem(true);

      const formData = new FormData();
      formData.append("title", newItemTitle);
      formData.append("type", newItemType);
      formData.append("content", newItemContent);

      if (newItemFile) {
        formData.append("moduleFile", newItemFile);
      }

      const { data } = await API.post(`/courses/${id}/modules`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!data?.success) {
        throw new Error(data?.message || "Failed to add item");
      }

      await loadData();
      closeAddForm();
    } catch (err) {
      console.error("ADD MODULE ERROR:", err);
      setAddMessage(err?.response?.data?.message || err.message || "Failed to add item.");
    } finally {
      setAddingItem(false);
    }
  };

  const handleQuizSubmit = async (e) => {
    e.preventDefault();
    if (!activeModule) return;

    try {
      setQuizSubmitting(true);
      setQuizMessage("");
      setQuizError("");

      const formData = new FormData();
      formData.append("answerText", quizAnswer);

      if (quizFile) {
        formData.append("submissionFile", quizFile);
      }

      const { data } = await submitQuiz(activeModule.id, formData);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to submit quiz");
      }

      setQuizMessage("Quiz submitted successfully.");
      setQuizAnswer("");
      setQuizFile(null);

      const refreshed = await getMySubmissions();
      setMySubmissions(refreshed?.data?.data || []);
    } catch (err) {
      console.error("QUIZ SUBMIT ERROR:", err);
      setQuizError(err?.response?.data?.message || err.message || "Failed to submit quiz.");
    } finally {
      setQuizSubmitting(false);
    }
  };

  const renderCourseFile = (fileUrl, fileType, title) => {
    if (!fileUrl) return null;

    const lowerUrl = fileUrl.toLowerCase();
    const isPdf = fileType?.includes("pdf") || lowerUrl.endsWith(".pdf");
    const isText =
      fileType?.startsWith("text/") ||
      lowerUrl.endsWith(".txt") ||
      lowerUrl.endsWith(".md");

    if (fileType?.startsWith("image/")) {
      return <img src={fileUrl} alt={title} className="lesson-view__image" />;
    }

    if (fileType?.startsWith("video/")) {
      return (
        <video controls className="lesson-view__video">
          <source src={fileUrl} type={fileType} />
        </video>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={fileUrl}
          title={title}
          className="lesson-view__pdf"
        />
      );
    }

    if (isText) {
      return (
        <a href={fileUrl} target="_blank" rel="noreferrer" className="lesson-view__file-link">
          Open text file
        </a>
      );
    }

    return (
      <a href={fileUrl} target="_blank" rel="noreferrer" className="lesson-view__file-link">
        Open uploaded file
      </a>
    );
  };

  const renderEducatorQuizPanel = () => {
    if (!activeModule || activeModule.type !== "quiz" || !isEducator) return null;

    return (
      <div className="quiz-panel">
        <h3 className="quiz-panel__title">Submit Quiz</h3>

        {activeEducatorSubmission ? (
          <div className="quiz-panel__submissionStatus">
            <p><strong>Status:</strong> {activeEducatorSubmission.status}</p>
            <p><strong>Grade:</strong> {activeEducatorSubmission.grade || "Not graded yet"}</p>
            <p><strong>Feedback:</strong> {activeEducatorSubmission.feedback || "No feedback yet"}</p>

            {activeEducatorSubmission.file_url && (
              <a
                href={activeEducatorSubmission.file_url}
                target="_blank"
                rel="noreferrer"
                className="lesson-view__file-link"
              >
                View Submitted File
              </a>
            )}
          </div>
        ) : (
          <form onSubmit={handleQuizSubmit} className="quiz-panel__form">
            <textarea
              className="quiz-panel__textarea"
              value={quizAnswer}
              onChange={(e) => setQuizAnswer(e.target.value)}
              placeholder="Enter your answer"
            />

            <input
              type="file"
              onChange={(e) => setQuizFile(e.target.files?.[0] || null)}
            />

            {quizMessage && <p className="quiz-panel__success">{quizMessage}</p>}
            {quizError && <p className="quiz-panel__error">{quizError}</p>}

            <button type="submit" disabled={quizSubmitting} className="quiz-panel__submit">
              {quizSubmitting ? "Submitting..." : "Submit Quiz"}
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderTrainerQuizPanel = () => {
    if (!activeModule || activeModule.type !== "quiz" || !isTrainerOrAdmin) return null;

    return (
      <div className="quiz-panel">
        <div className="quiz-panel__reviewHeader">
          <h3 className="quiz-panel__title">Submission Review</h3>
          <button
            type="button"
            className="quiz-panel__reviewButton"
            onClick={() => navigate(`/course-submissions/${id}`)}
          >
            Review Submissions
          </button>
        </div>

        {loadingSubmissions ? (
          <p>Loading submissions...</p>
        ) : (
          <p>
            {moduleSubmissions.length} submission
            {moduleSubmissions.length === 1 ? "" : "s"} for this quiz.
          </p>
        )}
      </div>
    );
  };

  const renderOverview = () => {
    if (!course) return null;

    return (
      <div className="lesson-view__content">
        <div className="lesson-view__hero">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="lesson-view__hero-image"
            />
          ) : (
            <div className="lesson-view__hero-image lesson-view__hero-image--placeholder">
              No Cover
            </div>
          )}

          <div className="lesson-view__hero-content">
            <p className="lesson-view__eyebrow">Main Lesson</p>
            <h1>{course.title}</h1>
            <p className="lesson-view__meta">
              {course.instructor} • {course.lessons ?? 0} lessons • {course.quizzes ?? 0} quizzes
            </p>
          </div>
        </div>

        {course.description && (
          <div className="lesson-view__text-block">
            <p>{course.description}</p>
          </div>
        )}

        {renderCourseFile(course.file_url, course.file_type, course.title)}

        {!course.file_url && (
          <div className="lesson-view__emptyState">
            <h3>No course file yet</h3>
            <p>Add modules and quizzes from the sidebar.</p>
          </div>
        )}
      </div>
    );
  };

  const renderModuleContent = () => {
    if (activeModuleId === "overview") {
      return renderOverview();
    }

    if (!activeModule) {
      return (
        <div className="lesson-view__emptyState">
          <h3>Select a lesson</h3>
          <p>Choose a lesson or quiz from the sidebar.</p>
        </div>
      );
    }

    return (
      <div className="lesson-view__content">
        <div className="lesson-view__top">
          <div>
            <p className="lesson-view__eyebrow">
              {activeModule.type === "quiz" ? "Quiz" : "Module"}
            </p>
            <h1>{activeModule.title}</h1>
          </div>

          {activeModule.type === "quiz" && (
            <div className="lesson-view__type-badge">Quiz</div>
          )}
        </div>

        {activeModule.content && (
          <div className="lesson-view__text-block">
            <p>{activeModule.content}</p>
          </div>
        )}

        {renderCourseFile(activeModule.file_url, activeModule.file_type, activeModule.title)}

        {!activeModule.content && !activeModule.file_url && (
          <div className="lesson-view__emptyState">
            <h3>No content yet</h3>
            <p>This {activeModule.type} does not have content yet.</p>
          </div>
        )}

        {renderEducatorQuizPanel()}
        {renderTrainerQuizPanel()}
      </div>
    );
  };

  if (loading) {
    return <div className="lesson-page">Loading course...</div>;
  }

  if (error) {
    return <div className="lesson-page">{error}</div>;
  }

  return (
    <section className="lesson-page">
      <aside className="lesson-sidebar">
        <div className="lesson-sidebar__header">
          <button
            className="lesson-sidebar__backBtn"
            onClick={() => navigate(-1)}
            type="button"
          >
            <span className="lesson-sidebar__backIcon">←</span>
            <span>Back to Courses</span>
          </button>

          <h2 className="lesson-sidebar__courseName">{course?.title}</h2>
        </div>

        <div className="lesson-sidebar__sectionHead">
          <h3 className="lesson-sidebar__heading">Course Content</h3>
        </div>

        <div className="lesson-sidebar__list">
          <button
            className={`lesson-sidebar__item ${activeModuleId === "overview" ? "is-active" : ""}`}
            onClick={() => setActiveModuleId("overview")}
            type="button"
          >
            <span className="lesson-sidebar__item-index">1</span>
            <span className="lesson-sidebar__item-main">
              <span className="lesson-sidebar__item-title">Overview</span>
              <span className="lesson-sidebar__item-subtitle">Main Lesson</span>
            </span>
          </button>

          {modules.map((item, index) => (
            <button
              key={item.id}
              className={`lesson-sidebar__item ${
                activeModuleId === item.id ? "is-active" : ""
              }`}
              onClick={() => setActiveModuleId(item.id)}
              type="button"
            >
              <span className="lesson-sidebar__item-index">{index + 2}</span>
              <span className="lesson-sidebar__item-main">
                <span className="lesson-sidebar__item-title">{item.title}</span>
                <span className="lesson-sidebar__item-subtitle">
                  {item.type === "quiz" ? "Quiz" : "Module"}
                </span>
              </span>
            </button>
          ))}

          {modules.length === 0 && (
            <div className="lesson-sidebar__empty">
              No extra modules yet
            </div>
          )}
        </div>

        {isTrainerOrAdmin && (
          <div className="lesson-sidebar__actions">
            <button
              className="lesson-sidebar__add-btn"
              onClick={() => openAddForm("lesson")}
              type="button"
            >
              + Add Module
            </button>

            <button
              className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
              onClick={() => openAddForm("quiz")}
              type="button"
            >
              + Add Quiz
            </button>
          </div>
        )}

        {showAddForm && isTrainerOrAdmin && (
          <form className="lesson-sidebar__add-form" onSubmit={handleAddItem}>
            <div className="lesson-sidebar__add-type">
              Adding: <strong>{newItemType === "quiz" ? "Quiz" : "Module"}</strong>
            </div>

            <input
              type="text"
              placeholder={`Enter ${newItemType} title`}
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
            />

            <textarea
              placeholder={`Enter ${newItemType} content`}
              value={newItemContent}
              onChange={(e) => setNewItemContent(e.target.value)}
            />

            <input
              type="file"
              accept=".pdf,.txt,.md,image/*,video/*"
              onChange={(e) => setNewItemFile(e.target.files?.[0] || null)}
            />

            {addMessage && (
              <p className="lesson-sidebar__add-message">{addMessage}</p>
            )}

            <div className="lesson-sidebar__add-controls">
              <button type="button" onClick={closeAddForm}>
                Cancel
              </button>
              <button type="submit" disabled={addingItem}>
                {addingItem ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </aside>

      <main className="lesson-view">
        {renderModuleContent()}
      </main>
    </section>
  );
}