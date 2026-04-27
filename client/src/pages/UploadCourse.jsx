import { useEffect, useMemo, useRef, useState } from "react";
import "../css/upload.css";
import API from "../api/api";

export default function UploadCourse() {
  const thumbnailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [resourceType, setResourceType] = useState("file");
  const [resourceUrl, setResourceUrl] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    description: "",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [courseFile, setCourseFile] = useState(null);

  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [fileObjectUrl, setFileObjectUrl] = useState("");
  const [fileType, setFileType] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const normalizedUrl = useMemo(() => resourceUrl.trim(), [resourceUrl]);

  const revokeFilePreview = () => {
    if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
  };

  const revokeThumbnailPreview = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  };

  const resetFileInputValues = () => {
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearCourseFile = () => {
    revokeFilePreview();
    setCourseFile(null);
    setFilePreview("");
    setFileObjectUrl("");
    setFileType("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAll = () => {
    revokeFilePreview();
    revokeThumbnailPreview();

    setFormData({
      title: "",
      instructor: "",
      description: "",
    });

    setResourceType("file");
    setResourceUrl("");
    setThumbnail(null);
    setCourseFile(null);
    setThumbnailPreview("");
    setFilePreview("");
    setFileObjectUrl("");
    setFileType("");
    setError("");
    setMessage("");
    resetFileInputValues();
  };

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
    };
  }, [thumbnailPreview, fileObjectUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setMessage("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResourceTypeChange = (e) => {
    const nextType = e.target.value;
    setResourceType(nextType);
    setError("");
    setMessage("");

    if (nextType === "url") {
      clearCourseFile();
    }

    if (nextType === "file") {
      setResourceUrl("");
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image file.");
      return;
    }

    revokeThumbnailPreview();

    setError("");
    setMessage("");
    setThumbnail(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const processCourseFile = (file) => {
    const fileName = file.name.toLowerCase();
    const detectedType = file.type || "";

    const isPdf = detectedType.includes("pdf") || fileName.endsWith(".pdf");
    const isText =
      detectedType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md");
    const isImage = detectedType.startsWith("image/");
    const isVideo = detectedType.startsWith("video/");

    if (!isImage && !isVideo && !isPdf && !isText) {
      setError("Only images, videos, PDFs, TXT, and MD files are allowed.");
      return;
    }

    revokeFilePreview();

    let normalizedType = detectedType;
    if (isPdf) normalizedType = "application/pdf";
    if (isText) normalizedType = "text/plain";

    const objectUrl = URL.createObjectURL(file);

    setError("");
    setMessage("");
    setCourseFile(file);
    setFileType(normalizedType);
    setFileObjectUrl(objectUrl);

    if (isText) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target?.result || "");
      };
      reader.readAsText(file);
    } else {
      setFilePreview(objectUrl);
    }
  };

  const handleCourseFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processCourseFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (resourceType !== "file") return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processCourseFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const isValidHttpUrl = (value) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!formData.title.trim()) {
      setError("Course title is required.");
      return;
    }

    if (!formData.instructor.trim()) {
      setError("Instructor name is required.");
      return;
    }

    if (resourceType === "file" && !courseFile) {
      setError("Please upload a course file.");
      return;
    }

    if (resourceType === "url") {
      if (!normalizedUrl) {
        setError("Please enter a resource URL.");
        return;
      }

      if (!isValidHttpUrl(normalizedUrl)) {
        setError("Please enter a valid http or https URL.");
        return;
      }
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title.trim());
      data.append("instructor", formData.instructor.trim());
      data.append("description", formData.description.trim());
      data.append("resourceType", resourceType);

      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      if (resourceType === "file") {
        data.append("courseFile", courseFile);
      }

      if (resourceType === "url") {
        data.append("resourceUrl", normalizedUrl);
      }

      const response = await API.post("/courses/upload", data);
      const result = response.data;

      if (!result?.success) {
        throw new Error(result?.message || "Failed to upload course");
      }

      clearAll();
      setMessage("Course uploaded successfully.");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      setError(
        err?.response?.data?.message || err.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCourseFilePreview = () => {
    if (!courseFile) return null;

    const fileName = courseFile.name.toLowerCase();
    const isPdf = fileType.includes("pdf") || fileName.endsWith(".pdf");
    const isText =
      fileType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md");

    if (fileType.startsWith("image/")) {
      return (
        <img
          src={fileObjectUrl}
          alt="Course file preview"
          className="upload-preview-media"
        />
      );
    }

    if (fileType.startsWith("video/")) {
      return (
        <video controls className="upload-preview-media">
          <source src={fileObjectUrl} type={courseFile.type || fileType} />
        </video>
      );
    }

    if (isPdf) {
      return (
        <iframe
          src={fileObjectUrl}
          title="PDF Preview"
          className="upload-preview-frame"
        />
      );
    }

    if (isText) {
      return <pre className="upload-preview-textbox">{filePreview}</pre>;
    }

    return <p className="upload-preview-text">Selected file: {courseFile.name}</p>;
  };

  return (
    <section className="upload-page">
      <header className="upload-page__header">
        <p className="upload-page__eyebrow">Course Studio</p>
        <h1 className="upload-page__title">Upload Course</h1>
        <p className="upload-page__subtitle">
          Add a course file or online resource. Modules and quizzes can be added later.
        </p>
      </header>

      <form className="upload-page__layout" onSubmit={handleSubmit}>
        <div className="upload-panel upload-panel--left">
          <div className="upload-card">
            <div className="upload-card__header">
              <h2>Course Resource</h2>
              <p>Choose between uploading a file or linking an online resource.</p>
            </div>

            <label className="upload-field">
              <span>Resource Type</span>
              <select value={resourceType} onChange={handleResourceTypeChange}>
                <option value="file">Upload File</option>
                <option value="url">Online Resource URL</option>
              </select>
            </label>

            {resourceType === "url" ? (
              <label className="upload-field">
                <span>Resource URL</span>
                <input
                  type="url"
                  placeholder="https://example.com/resource"
                  value={resourceUrl}
                  onChange={(e) => {
                    setResourceUrl(e.target.value);
                    setError("");
                    setMessage("");
                  }}
                />
              </label>
            ) : (
              <>
                <div
                  className="upload-dropzone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <div className="upload-dropzone__icon">☁</div>
                  <h3>Drag and drop your course file</h3>
                  <p>or click to browse</p>
                  <span className="upload-dropzone__hint">
                    PDF, TXT, MD, image, or video
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,image/*,video/*"
                  className="hidden-file-input"
                  onChange={handleCourseFileChange}
                />
              </>
            )}

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handleThumbnailChange}
            />

            <div className="upload-actions-row">
              {resourceType === "file" && (
                <button
                  type="button"
                  className="upload-secondary-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Course File
                </button>
              )}

              <button
                type="button"
                className="upload-secondary-btn"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Browse Thumbnail
              </button>
            </div>

            <div className="upload-file-list">
              <div className="upload-file-row">
                <div>
                  <strong>Course Resource</strong>
                  <p>
                    {resourceType === "file"
                      ? courseFile?.name || "No file selected"
                      : normalizedUrl || "No URL entered"}
                  </p>
                </div>

                {((resourceType === "file" && courseFile) ||
                  (resourceType === "url" && normalizedUrl)) && (
                  <span className="upload-file-row__status">Ready</span>
                )}
              </div>

              <div className="upload-file-row">
                <div>
                  <strong>Thumbnail</strong>
                  <p>{thumbnail ? thumbnail.name : "No thumbnail selected"}</p>
                </div>

                {thumbnail && <span className="upload-file-row__status">Ready</span>}
              </div>
            </div>
          </div>

          {(courseFile || thumbnailPreview || (resourceType === "url" && normalizedUrl)) && (
            <div className="upload-card">
              <div className="upload-card__header">
                <h2>Preview</h2>
                <p>Review your selected resource before publishing.</p>
              </div>

              {courseFile && (
                <div className="upload-preview-section">
                  <h3>Course File Preview</h3>
                  {renderCourseFilePreview()}
                </div>
              )}

              {resourceType === "url" && normalizedUrl && (
                <div className="upload-preview-section">
                  <h3>URL Preview</h3>
                  <div className="upload-url-preview">
                    <p>{normalizedUrl}</p>
                    <a href={normalizedUrl} target="_blank" rel="noreferrer">
                      Open resource
                    </a>
                  </div>
                  <p className="upload-note">
                    Some websites block embedded previews, so students will also receive
                    the direct resource link.
                  </p>
                </div>
              )}

              {thumbnailPreview && (
                <div className="upload-preview-section">
                  <h3>Thumbnail Preview</h3>
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="upload-preview-media"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="upload-panel upload-panel--right">
          <div className="upload-card upload-card--sticky">
            <div className="upload-card__header">
              <h2>Course Details</h2>
              <p>Fill in the basic information for the course.</p>
            </div>

            <div className="upload-form-grid">
              <label className="upload-field">
                <span>Title</span>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter course title"
                  value={formData.title}
                  onChange={handleChange}
                />
              </label>

              <label className="upload-field">
                <span>Instructor</span>
                <input
                  type="text"
                  name="instructor"
                  placeholder="Enter instructor name"
                  value={formData.instructor}
                  onChange={handleChange}
                />
              </label>

              <label className="upload-field">
                <span>Description</span>
                <textarea
                  name="description"
                  placeholder="Write a course description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </label>
            </div>

            <p className="upload-note">
              After upload, trainers can add modules and quizzes to this course.
            </p>

            {error && <p className="upload-message upload-message--error">{error}</p>}
            {message && (
              <p className="upload-message upload-message--success">{message}</p>
            )}

            <div className="upload-form-actions">
              <button
                type="button"
                className="upload-ghost-btn"
                onClick={clearAll}
                disabled={loading}
              >
                Clear
              </button>

              <button
                type="submit"
                className="upload-primary-btn"
                disabled={loading}
              >
                {loading ? "Publishing..." : "Publish Course"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}