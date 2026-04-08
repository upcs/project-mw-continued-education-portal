import { useNavigate } from "react-router-dom";

export default function EnrolledCourseList({ courses = [] }) {
  const navigate = useNavigate();

  if (!courses.length) {
    return <p>No enrolled courses found.</p>;
  }

  const formatSource = (source) => {
    if (source === "principal") return "Principal Assigned";
    if (source === "self") return "Self Enrolled";
    return "—";
  };

  const formatStatus = (status) => {
    if (!status) return "—";
    return status.replace("_", " ");
  };

  return (
    <div className="enrolled-list">
      {courses.map((course) => (
        <div
          key={course.id}
          className="enrolled-course-card"
          onClick={() => navigate(`/course-details/${course.id}`)}
          style={{ cursor: "pointer" }}
        >
          <div className="enrolled-course-card__cover">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="enrolled-course-card__image"
              />
            ) : (
              <div className="enrolled-course-card__image enrolled-course-card__image--placeholder">
                No Cover
              </div>
            )}
          </div>

          <div className="enrolled-course-card__body">
            <h3 className="enrolled-course-card__title">{course.title}</h3>
            <p className="enrolled-course-card__author">{course.instructor}</p>
            <p className="enrolled-course-card__progress">
              {course.progress || 0}% progress
            </p>

            <div className="enrolled-course-card__meta">
              <p className="enrolled-course-card__detail">
                <strong>Status:</strong> {formatStatus(course.assignment_status)}
              </p>
              <p className="enrolled-course-card__detail">
                <strong>Source:</strong> {formatSource(course.source)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}