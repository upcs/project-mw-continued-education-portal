import "../../css/course-row.css";
export default function EnrolledCourseRow() {
  return (
    <div className="enroll-row">
      <div className="enroll-row__left">
        <div className="enroll-row__icon" />
        <div>
          <p className="enroll-row__title">
            Basic of English Language
          </p>
          <div className="enroll-row__progress">
            <div className="enroll-row__bar" />
          </div>
        </div>
      </div>

      <div className="enroll-row__right">
        <span>2/10</span>
        <span>3/5</span>
      </div>
    </div>
  );
}