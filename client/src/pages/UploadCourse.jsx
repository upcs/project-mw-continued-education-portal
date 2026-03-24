import "../css/upload.css";

export default function UploadCourse() {
  return (
    <section className="upload-page">
      <h1 className="upload-page__title">Upload Contents</h1>

      <div className="upload-page__layout">
        
        {/* LEFT: Upload */}
        <div className="upload-box">
          <div className="upload-box__drop">
            <div className="upload-box__circle">
              <div className="upload-box__icon">☁</div>
              <p>Drag and Drop<br />or Browse</p>
            </div>
          </div>

          <div className="upload-list">
            <div className="upload-item">
              <span>UI.png</span>
              <div className="upload-bar">
                <div className="upload-bar__fill" style={{ width: "100%" }} />
              </div>
              <span>✓</span>
            </div>

            <div className="upload-item">
              <span>Web.png</span>
              <div className="upload-bar">
                <div className="upload-bar__fill" style={{ width: "75%" }} />
              </div>
              <span>✕</span>
            </div>

            <div className="upload-item">
              <span>Moon.ai</span>
              <div className="upload-bar">
                <div className="upload-bar__fill" style={{ width: "44%" }} />
              </div>
              <span>✕</span>
            </div>
          </div>
        </div>

        {/* RIGHT: FORM */}
        <div className="upload-form">
          <label>Title</label>
          <input type="text" placeholder="Enter title" />

          <label>Description</label>
          <textarea placeholder="Write a detailed description" />

          <small>You will be able to edit this information later</small>

          <label>Tags</label>
          <div className="tags">
            <span className="tag">Design</span>
            <span className="tag">UX/UI</span>
            <span className="tag">Illustration</span>
            <span className="tag">Motion</span>
            <span className="tag">Web</span>
            <button className="tag tag--add">+ Add</button>
          </div>

          <div className="form-actions">
            <button className="btn-cancel">Cancel</button>
            <button className="btn-primary">Publish</button>
          </div>
        </div>

      </div>
    </section>
  );
}