import { useEffect, useRef, useState } from "react";
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

  const revokePreviewUrls = () => {
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);
  };

  const resetFileInputValues = () => {
    if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearAll = () => {
    revokePreviewUrls();

    setFormData({
      title: "",
      instructor: "",
      description: "",
    });

    setThumbnail(null);
    setCourseFile(null);
    setThumbnailPreview("");
    setFilePreview("");
    setFileObjectUrl("");
    setFileType("");
    setError("");
    setMessage("");
    resetFileInputValues();
    setResourceUrl("");
    setResourceType("file");
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Thumbnail must be an image file.");
      return;
    }

    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);

    setError("");
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
      setError("Only images, videos, PDFs, and text files are allowed.");
      return;
    }

    if (fileObjectUrl) URL.revokeObjectURL(fileObjectUrl);

    setError("");
    setCourseFile(file);

    let normalizedType = detectedType;
    if (isPdf) normalizedType = "application/pdf";
    else if (isText) normalizedType = "text/plain";

    setFileType(normalizedType);

    const objectUrl = URL.createObjectURL(file);
    setFileObjectUrl(objectUrl);

    if (isText) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result || "");
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
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processCourseFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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

    if (resourceType === "url" && !resourceUrl.trim()) {
      setError("Please enter a resource URL.");
      return;
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

      if (resourceType === "file" && courseFile) {
        data.append("courseFile", courseFile);
      }

      if (resourceType === "url") {
        data.append("resourceUrl", resourceUrl.trim());
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
          className="upload-preview-pdf"
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
      <div className="upload-page__header">
        <div>
          <h1 className="upload-page__title">Upload Course</h1>
          <p className="upload-page__subtitle">
            Upload the main course file. Lesson count, quiz count, and learner
            progress are calculated automatically later from modules and quizzes.
          </p>
        </div>
      </div>

      <form className="upload-page__layout" onSubmit={handleSubmit}>
        <div className="upload-panel upload-panel--left">
          <div className="upload-card">
            <div className="upload-card__header">
              <h2>Course Files</h2>
              <p>Upload the main course file and an optional thumbnail.</p>
            </div>

              <div className="upload-field">
                <span>Resource Type</span>
                <select
                  value={resourceType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setResourceType(newType);
                    
                    if(newType === "url"){
                      setCourseFile(null);
                      setFilePreview("");
                      setFileObjectUrl("");
                    }
                    if (newType === "file"){
                      setResourceUrl("");
                    }

                    setError("");
                  }}
                  >
                  <option value="file">Upload File</option>
                  <option value="url">Online Resource (URL)</option>
                </select>
              </div>
            
              {resourceType === "url" && (
              <label className="upload-field">
                <span>Resource URL</span>
                <input
                  type="url"
                  placeholder="https://..."
                  value={resourceUrl}
                  onChange={(e) => setResourceUrl(e.target.value)}
                />
              </label>
              )}


              <div
                  className="upload-dropzone"
                  onDrop={resourceType === "file" ? handleDrop : undefined}
                  onDragOver={resourceType === "file" ? handleDragOver : undefined}
                  onClick={() => 
                  resourceType === "file" && fileInputRef.current?.click()
                  }
                  > 
                  <button
                    type="button"
                    className="upload-secondary-btn"
                    disabled={resourceType !== "file"}
                    onClick={() => fileInputRef.current?.click()}
                    >
                    Browse Course File
                  </button>

                  <div className="upload-dropzone__icon">☁</div>
                 <h3>Drag and drop your course file</h3>
                 <p>or click here to browse</p>
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

            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              className="hidden-file-input"
              onChange={handleThumbnailChange}
            />

            <div className="upload-actions-row">
              <button
                type="button"
                className="upload-secondary-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Course File
              </button>

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
                  <strong>Course File</strong>
                  <p>{courseFile ? courseFile.name : "No file selected"}</p>
                </div>
                {courseFile && <span className="upload-file-row__status">Ready</span>}
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

          {(courseFile || thumbnailPreview || (resourceType === "url" && resourceUrl.trim())) && (
            <div className="upload-card">
              <div className="upload-card__header">
                <h2>Preview</h2>
                <p>Review selected files before publishing.</p>
              </div>

              {courseFile && (
                <div className="upload-preview-section">
                  <h3>Course File Preview</h3>
                  {renderCourseFilePreview()}
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

              {resourceType === "url" && resourceUrl.trim() && (
                <div className="upload-preview-section">
                  <h3>URL Preview</h3>
                  <iframe
                    src={resourceUrl.trim()}
                    title="Resource preview"
                    className="upload-preview-pdf"
                    sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    referrerPolicy="no-referrer"
                  />
                  <a
                    href={resourceUrl.trim()}
                    target="_blank"
                    rel="noreferrer"
                    className="lesson-view__file-link"
                    style={{ display: "inline-block", marginTop: "8px" }}
                  >
                    Open resource in new tab
                  </a>
                </div>
              )}

            </div>
          )}
        </div>

        <div className="upload-panel upload-panel--right">
          <div className="upload-card">
            <div className="upload-card__header">
              <h2>Course Details</h2>
              <p>Fill in the base information for the course.</p>
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
                  placeholder="Write a detailed description"
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
