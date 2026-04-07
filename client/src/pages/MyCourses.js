import { useEffect, useState } from "react";
import { getEnrolledCourses } from "../api/courses";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await getEnrolledCourses();
        setCourses(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div>
      {courses.map((course) => (
        <div key={course.id}>
          <h3>{course.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default MyCourses;