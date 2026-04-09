import { useEffect, useRef, useState } from "react";
import "../css/upload.css";
import API from "../api/api";


export default function UploadCourse() {
  const thumbnailInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    lessons: "",
    quizzes: "",
    progress: "",
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
      lessons: "",
      quizzes: "",
      progress: "",
      description: "",
    });
    setThumbnail(null);
    setCourseFile(null);
    setThumbnailPreview("");
    setFilePreview("");
    setFileObjectUrl("");
    setFileType("");
    setError("");
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

    const isPdf =
      detectedType.includes("pdf") || fileName.endsWith(".pdf");

    const isText =
      detectedType.startsWith("text/") ||
      fileName.endsWith(".txt") ||
      fileName.endsWith(".md");

    const isImage = detectedType.startsWith("image/");
    const isVideo = detectedType.startsWith("video/");

    if (!isImage && !isVideo && !isPdf && !isText) {
      setError("Only images, videos, PDFs, and text files are allowed for course files.");
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

    try {
      setLoading(true);

      const data = new FormData();
      data.append("title", formData.title);
      data.append("instructor", formData.instructor);
      data.append("lessons", formData.lessons || 0);
      data.append("quizzes", formData.quizzes || 0);
      data.append("progress", formData.progress || 0);
      data.append("description", formData.description);

      if (thumbnail) {
        data.append("thumbnail", thumbnail);
      }

      if (courseFile) {
        data.append("courseFile", courseFile);
      }

      const response = await API.get("/courses/upload", {
        method: "POST",
        body: data,
      });

      const text = await response.text();
      console.log("UPLOAD RAW RESPONSE:", text);

      let result;
      try {
        result = JSON.parse(text);
      } catch {
        throw new Error("Server did not return valid JSON");
      }

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload course");
      }

      clearAll();
      setMessage("Course uploaded successfully.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const renderCourseFilePreview = () => {
    if (!courseFile) return null;

    const fileName = courseFile.name.toLowerCase();

    const isPdf =
      fileType.includes("pdf") || fileName.endsWith(".pdf");

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
      return (
        <pre className="upload-preview-textbox">
          {filePreview}
        </pre>
      );
    }

    return (
      <p className="upload-preview-text">
        Selected file: {courseFile.name}
      </p>
    );
  };

  return (
    <section className="upload-page">
      <h1 className="upload-page__title">Upload Contents</h1>

      <form className="upload-page__layout" onSubmit={handleSubmit}>
        <div className="upload-box">
          <div
            className="upload-box__drop"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-box__circle">
              <div className="upload-box__icon">☁</div>
              <p>
                Drag and Drop
                <br />
                or Browse Course File
              </p>
            </div>
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

          <div className="upload-list">
            <div className="upload-item upload-item--static">
              <span>Course File</span>
              <button
                type="button"
                className="upload-action-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse File
              </button>
            </div>

            <div className="upload-item upload-item--static">
              <span>Thumbnail</span>
              <button
                type="button"
                className="upload-action-btn"
                onClick={() => thumbnailInputRef.current?.click()}
              >
                Browse Thumbnail
              </button>
            </div>

            {courseFile && (
              <div className="upload-item">
                <span>{courseFile.name}</span>
                <div className="upload-bar">
                  <div className="upload-bar__fill" style={{ width: "100%" }} />
                </div>
                <span>✓</span>
              </div>
            )}

            {thumbnail && (
              <div className="upload-item">
                <span>{thumbnail.name}</span>
                <div className="upload-bar">
                  <div className="upload-bar__fill" style={{ width: "100%" }} />
                </div>
                <span>✓</span>
              </div>
            )}

            {!thumbnail && !courseFile && (
              <div className="upload-empty-state">
                No files selected yet.
              </div>
            )}
          </div>

          {courseFile && (
            <div className="upload-preview-block">
              <h3>Course File Preview</h3>
              {renderCourseFilePreview()}
            </div>
          )}

          {thumbnailPreview && (
            <div className="upload-preview-block">
              <h3>Thumbnail Preview</h3>
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="upload-preview-media"
              />
            </div>
          )}
        </div>

        <div className="upload-form">
          <label>Title</label>
          <input
            type="text"
            name="title"
            placeholder="Enter title"
            value={formData.title}
            onChange={handleChange}
          />

          <label>Instructor</label>
          <input
            type="text"
            name="instructor"
            placeholder="Enter instructor name"
            value={formData.instructor}
            onChange={handleChange}
          />

          <div className="upload-form__row">
            <div>
              <label>Lessons</label>
              <input
                type="number"
                name="lessons"
                placeholder="0"
                value={formData.lessons}
                onChange={handleChange}
              />
            </div>

            <div>
              <label>Quizzes</label>
              <input
                type="number"
                name="quizzes"
                placeholder="0"
                value={formData.quizzes}
                onChange={handleChange}
              />
            </div>
          </div>

          <label>Progress</label>
          <input
            type="number"
            name="progress"
            min="0"
            max="100"
            placeholder="0 to 100"
            value={formData.progress}
            onChange={handleChange}
          />

          <label>Description</label>
          <textarea
            name="description"
            placeholder="Write a detailed description"
            value={formData.description}
            onChange={handleChange}
          />

          <small>You will be able to edit this information later</small>

          {error && <p className="upload-message upload-message--error">{error}</p>}
          {message && <p className="upload-message upload-message--success">{message}</p>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={clearAll}
            >
              Cancel
            </button>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
