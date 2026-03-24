export default function UploadToolbar() {
  return (
    <section className="proto-toolbar">
      <div className="proto-toolbar__left">
        <button type="button" className="proto-toolbar__filter">
          Filter: All Courses ▼
        </button>
      </div>

      <div className="proto-toolbar__right">
        <button type="button" className="proto-toolbar__create">
          ＋ CREATE COURSES
        </button>
      </div>
    </section>
  );
}