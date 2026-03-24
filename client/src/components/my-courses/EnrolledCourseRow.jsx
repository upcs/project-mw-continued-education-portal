import "../../css/course-row.css";
import { useNavigate } from "react-router-dom";

export default function EnrolledCourseRow({ 
  id,
  title,
  progress = 30,
  lessons = "2/10",
  quizzes = "3/5",
 }) {
  const navigate = useNavigate();

  const handleRowClick = () => {
    navigate(`/course-details/${id}`)};

  return (
    <div
      className="enroll-row"
      onClick={handleRowClick}
    >
      <div className="enroll-row__left">
        <div className="enroll-row__icon" />

        <div>
          <div className="enroll-row__title">{title}</div>

          <div className="enroll-row__progress">
            <div 
              className="enroll-row__bar" 
              style={{ width: `${progress}%`}}
            />
          </div>
        </div>
      </div>

      <div className="enroll-row__right">
        <span className="enroll-pill">{lessons}</span>
        <span className="enroll-pill enroll-pill--muted">{quizzes}</span>

      </div>
    </div>
  );
}