import EnrolledCourseRow from "./EnrolledCourseRow";

export default function EnrolledList() {
  const data = [1, 2, 3, 4];

  return (
    <div className="enrolled">
      <div className="enrolled__head">
        <h3>Enrolled Courses</h3>
        <button className="btn btn--primary">Course Catalog</button>
      </div>

      <div className="enrolled__list">
        {data.map((item) => (
          <EnrolledCourseRow key={item} />
        ))}
      </div>
    </div>
  );
}