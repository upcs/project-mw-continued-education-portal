import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../css/course-details.css";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { markCourseStarted } from "../api/courses";
import mammoth from "mammoth";

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

  const [newResourceType, setNewResourceType] = useState("file");
  const [newResourceUrl, setNewResourceUrl] = useState("");

  const [isEditMode, setIsEditMode] = useState(false);
  const [deletingCourse, setDeletingCourse] = useState(false);
  const [deletingModuleId, setDeletingModuleId] = useState(null);
  
  const canEditContent = user?.role === "admin" || user?.role === "trainer";

  const canDeleteCourse =
    user?.role === "admin" ||
    (user?.role === "trainer" &&
      course?.uploaded_by_email?.toLowerCase() === user?.email?.toLowerCase());

  const canDeleteModule = (moduleItem) =>
    user?.role === "admin" ||
    (user?.role === "trainer" &&
      moduleItem?.created_by_email?.toLowerCase() === user?.email?.toLowerCase());

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
      setError(
        err?.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const startCourseIfNeeded = async () => {
      if (!isEducator || !id) return;

      try {
        await markCourseStarted(id);
      } catch (err) {
        console.error("MARK COURSE STARTED ERROR:", err);
      }
    };

    startCourseIfNeeded();
  }, [id, isEducator]);


  const activeModule = useMemo(() => {
    if (activeModuleId === "overview") return null;
    return modules.find((item) => item.id === activeModuleId) || null;
  }, [modules, activeModuleId]);


  function InlineTextFile({ fileUrl }) {
    const [textContent, setTextContent] = useState("");
    const [textLoading, setTextLoading] = useState(true);
    const [textError, setTextError] = useState("");

    useEffect(() => {
      let isMounted = true;

      const loadText = async () => {
        try {
          setTextLoading(true);
          setTextError("");

          const response = await fetch(fileUrl);
          const text = await response.text();

          if (isMounted) {
            setTextContent(text);
          }
        } catch (error) {
          if (isMounted) {
            setTextError("Failed to load text file.");
          }
        } finally {
          if (isMounted) {
            setTextLoading(false);
          }
        }
      };

      if (fileUrl) {
        loadText();
      }

      return () => {
        isMounted = false;
      };
    }, [fileUrl]);

    if (textLoading) {
      return <p>Loading text file...</p>;
    }

    if (textError) {
      return <p>{textError}</p>;
    }

    return <pre className="upload-preview-textbox">{textContent}</pre>;
  }

  function InlineDocxFile({ fileUrl }) {
    const [htmlContent, setHtmlContent] = useState("");
    const [docxLoading, setDocxLoading] = useState(true);
    const [docxError, setDocxError] = useState("");

    useEffect(() => {
      let isMounted = true;

      const loadDocx = async () => {
        try {
          setDocxLoading(true);
          setDocxError("");

          const response = await fetch(fileUrl);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });

          if (isMounted) {
            setHtmlContent(result.value || "");
          }
        } catch (error) {
          if (isMounted) {
            setDocxError("Failed to load Word document.");
          }
        } finally {
          if (isMounted) {
            setDocxLoading(false);
          }
        }
      };

      if (fileUrl) {
        loadDocx();
      }

      return () => {
        isMounted = false;
      };
    }, [fileUrl]);

    if (docxLoading) {
      return <p>Loading Word document...</p>;
    }

    if (docxError) {
      return <p>{docxError}</p>;
    }

    return (
      <div
        className="lesson-view__text-block"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    );
  }

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
    setNewResourceType("file");
    setNewResourceUrl("");
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setAddMessage("");

    if (!newItemTitle.trim()) {
      setAddMessage("Title is required.");
      return;
    }
    if (newResourceType === "file" && !newItemFile) {
      setAddMessage("Please upload a module file.");
      return;
    }

    if (newResourceType === "url" && !newResourceUrl.trim()) {
      setAddMessage("Please enter a resource URL.");
      return;
    }

    try {
      setAddingItem(true);

      const formData = new FormData();
      formData.append("title", newItemTitle);
      formData.append("type", newItemType);
      formData.append("content", newItemContent);

      formData.append("resourceType", newResourceType);

      if (newResourceType === "file" && newItemFile) {
        formData.append("moduleFile", newItemFile);
      }

      if (newResourceType === "url") {
        formData.append("resourceUrl", newResourceUrl.trim());
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
      setAddMessage(
        err?.response?.data?.message || err.message || "Failed to add item."
      );
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!course?.id) return;

    const confirmed = window.confirm(
      `Delete "${course.title}" and all of its modules, quizzes, and submissions? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingCourse(true);
      setError("");
      setAddMessage("");

      const { data } = await API.delete(`/courses/${course.id}`);

      if (!data?.success) {
        throw new Error(data?.message || "Failed to delete course");
      }

      setAddMessage("Course Deleted Successfully.");
      navigate("/courses");
    } catch (err) {
      console.error("DELETE COURSE ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to delete course."
      );
    } finally {
      setDeletingCourse(false);
    }
  };

  const handleDeleteModule = async (moduleItem) => {
    if (!moduleItem?.id) return;

    const label = moduleItem.type === "quiz" ? "quiz" : "module";
    const confirmed = window.confirm(
      `Delete "${moduleItem.title}"? This ${label} and any related submissions will be removed.`
    );

    if (!confirmed) return;

    try {
      setDeletingModuleId(moduleItem.id);
      setAddMessage("");
      setError("");

      const { data } = await API.delete(`/modules/${moduleItem.id}`);

      if (!data?.success) {
        throw new Error(data?.message || `Failed to delete ${label}`);
      }

      if (Number(activeModuleId) === Number(moduleItem.id)) {
        setActiveModuleId("overview");
      }

      await loadData();
    } catch (err) {
      console.error("DELETE MODULE ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Failed to delete item."
      );
    } finally {
      setDeletingModuleId(null);
    }
  };

  const renderEducatorQuizPanel = () => {
    if (!activeModule || activeModule.type !== "quiz" || !isEducator) return null;

    return (
      <div className="quiz-panel">
        <h3 className="quiz-panel__title">Quiz</h3>
        <p>Open the quiz and complete all questions before submitting.</p>

        <button
          type="button"
          className="app-btn app-btn--primary"
          onClick={() => navigate(`/take-quiz/${activeModule.id}`)}
        >
          Take Quiz
        </button>
      </div>
    );
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

    const isDocx = fileType?.includes("wordprocessingml") || lowerUrl.endsWith(".docx");

    if (fileType?.startsWith("video/")) {
      return (
        <video controls className="lesson-view__video">
          <source src={fileUrl} type={fileType} />
        </video>
      );
    }

    if (isPdf) {
      return <iframe src={fileUrl} title={title} className="lesson-view__pdf" />;
    }

    if (isText) {
      return <InlineTextFile fileUrl={fileUrl} />;
    }

    if (isDocx) {
      return <InlineDocxFile fileUrl={fileUrl} />;
    }

    return (
      <a
        href={fileUrl}
        target="_blank"
        rel="noreferrer"
        className="lesson-view__file-link"
      >
        Open uploaded file
      </a>
    );
  };

  const renderResource = (item) => {
      if (!item) return null;

      if(item.resource_type === "url"){
        if(item.embed_url){
          return(
            <iframe
              src={item.embed_url}
              title={item.title}
              className="lesson-view__pdf"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />

          );
        }

        if(item.resource_url){
          return(
            <a 
              href={item.resource_url}
              target="blank"
              rel="noreferrer"
              className="lesson-view__file-link"
            >
              Open Resource
            </a>
          );
        }
        return null;
      }

      return renderCourseFile(item.file_url, item.file_type, item.title);
    };

  

  const renderTrainerQuizPanel = () => {
    if (!activeModule || activeModule.type !== "quiz" || !isTrainerOrAdmin) return null;

    return (
      <div className="quiz-panel">
        <div className="quiz-panel__reviewHeader">
          <h3 className="quiz-panel__title">Quiz Management</h3>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "12px",
          }}
        >
          <button
            type="button"
            className="app-btn app-btn--secondary"
            onClick={() => navigate(`/quiz-builder/${activeModule.id}`)}
          >
            Build Quiz
          </button>

          <button
            type="button"
            className="app-btn app-btn--primary"
            onClick={() => navigate(`/quiz-review/${activeModule.id}`)}
          >
            Review Attempts
          </button>
        </div>
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
              {course.instructor} • {course.lessons ?? 0} lessons •{" "}
              {course.quizzes ?? 0} quizzes
            </p>

            {isEditMode && canDeleteCourse && (
              <div style={{ marginTop: "12px" }}>
                <button
                  type="button"
                  className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
                  onClick={handleDeleteCourse}
                  disabled={deletingCourse}
                >
                  {deletingCourse ? "Deleting Course..." : "Delete Course"}
                </button>
              </div>
            )}

            {isEducator && course.assignment_status && (
              <p className="lesson-view__assignmentMeta">
                Status: {course.assignment_status}
                {course.source ? ` • Source: ${course.source}` : ""}
              </p>
            )}
          </div>
        </div>

        {course.description && (
          <div className="lesson-view__text-block">
            <p>{course.description}</p>
          </div>
        )}

        {renderResource(course)}

        {!course.file_url && !course.resource_url && (
          <div className="lesson-view__emptyState">
            <h3>No course resource yet</h3>
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

          {isEditMode && canDeleteModule(activeModule) && (
            <button
              type="button"
              className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
              onClick={() => handleDeleteModule(activeModule)}
              disabled={deletingModuleId === activeModule.id}
              >
              {deletingModuleId === activeModule.id
                ? "Deleting..."
                : activeModule.type === "quiz"
                ? "Delete Quiz"
                : "Delete Module"}
            </button>
          )}

        </div>

        {activeModule.content && (
          <div className="lesson-view__text-block">
            <p>{activeModule.content}</p>
          </div>
        )}

        {renderResource(activeModule)}

        {!activeModule.content && !activeModule.file_url && !activeModule.resource_url && (
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
          {canEditContent && (
            <button
              type="button"
              className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
              onClick={() => setIsEditMode((prev) => !prev)}
              style={{ marginTop: "10px" }}
            >
              {isEditMode ? "Done" : "Edit"}
            </button>
          )}
        </div>

        <div className="lesson-sidebar__sectionHead">
          <h3 className="lesson-sidebar__heading">Course Content</h3>
        </div>

        <div className="lesson-sidebar__list">
          <button
            className={`lesson-sidebar__item ${
              activeModuleId === "overview" ? "is-active" : ""
            }`}
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
            <div
              key={item.id}
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
            >
              <button
                className={`lesson-sidebar__item ${
                  activeModuleId === item.id ? "is-active" : ""
                }`}
                onClick={() => setActiveModuleId(item.id)}
                type="button"
                style={{ flex: 1 }}
              >
                <span className="lesson-sidebar__item-index">{index + 2}</span>
                <span className="lesson-sidebar__item-main">
                  <span className="lesson-sidebar__item-title">{item.title}</span>
                  <span className={`module-badge module-badge--${item.type}`}>
                    {item.type === "quiz" ? "Quiz" : "Module"}
                  </span>
                </span>
              </button>

              {isEditMode && canDeleteModule(item) && (
                <button
                  type="button"
                  className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
                  onClick={() => handleDeleteModule(item)}
                  disabled={deletingModuleId === item.id}
                  style={{ padding: "8px 10px", minWidth: "unset" }}
                >
                  {deletingModuleId === item.id ? "..." : "Delete"}
                </button>
              )}

              {isEditMode && isTrainerOrAdmin && item.type === "quiz" && (
                <button
                  type="button"
                  className="lesson-sidebar__add-btn lesson-sidebar__add-btn--secondary"
                  onClick={() => navigate(`/quiz-builder/${item.id}`)}
                  style={{ padding: "8px 10px", minWidth: "unset" }}
                >
                  Build
                </button>
              )}
            </div>
          ))}

          {modules.length === 0 && (
            <div className="lesson-sidebar__empty">No extra modules yet</div>
          )}
        </div>

        {isTrainerOrAdmin && isEditMode && (
          <div className="lesson-sidebar__actions">
            <button
              className="app-btn app-btn--danger"
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

            <div className="upload-field">
              <span>Resource Type</span>
              <select
                value={newResourceType}
                onChange={(e) => {
                  const type = e.target.value;
                  setNewResourceType(type);

                  if (type === "url") {
                    setNewItemFile(null);
                  }

                  if (type === "file") {
                    setNewResourceUrl("");
                  }
                }}
              >
                <option value="file">Upload File</option>
                <option value="url">Online Resource (URL)</option>
              </select>
            </div>

            {newResourceType === "url" && (
              <input
                type="url"
                placeholder="https://..."
                value={newResourceUrl}
                onChange={(e) => setNewResourceUrl(e.target.value)}
              />
            )}

            {newResourceType === "file" && (
              <input
                type="file"
                accept=".pdf,.txt,.md,image/*,video/*"
                onChange={(e) => setNewItemFile(e.target.files?.[0] || null)}
              />
            )}

            {addMessage && (
              <p className="lesson-sidebar__add-message">{addMessage}</p>
            )}

            <div className="lesson-sidebar__add-controls">
              <button type="button" className="app-btn app-btn--secondary" onClick={closeAddForm}>
                Cancel
              </button>
              
              <button type="submit" className="app-btn app-btn--primary" disabled={addingItem}>
                {addingItem ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        )}
      </aside>

      <main className="lesson-view">{renderModuleContent()}</main>
    </section>
  );
}
