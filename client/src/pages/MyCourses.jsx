import { useEffect, useMemo, useState } from "react";
import "../css/my-courses.css";
import { useNavigate } from "react-router-dom";
import EnrolledList from "../components/my-courses/EnrolledCourseList";
import API from "../api/api";


export default function MyCourses() {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/courses/enrolled");
        
        if (!data?.success) {
            throw new Error(data?.message || "Failed to fetch enrolled courses");
        }

        setCourses(data.data || []);

      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = courses.filter(
      (course) => course.assignment_status === "completed"
    ).length;

    const totalProgress = courses.reduce(
      (sum, course) => sum + (Number(course.progress) || 0),
      0
    );

    const averageProgress = totalCourses
      ? Math.round(totalProgress / totalCourses)
      : 0;

    const totalLessons = courses.reduce(
      (sum, course) => sum + (Number(course.lessons) || 0),
      0
    );

    const totalQuizzes = courses.reduce(
      (sum, course) => sum + (Number(course.quizzes) || 0),
      0
    );

    return {
      totalCourses,
      completedCourses,
      averageProgress,
      totalLessons,
      totalQuizzes,
    };
  }, [courses]);

  return (
    <section className="courses-page">
      <h1 className="courses-page__title">My Courses</h1>

      {loading && <p>Loading courses...</p>}
      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="courses-page__layout">
          <div className="courses-page__main">
            <section className="courses-block">
              <h2 className="courses-block__title">Progress</h2>
              <div className="progress-box">
                <div className="progress-box__sky" />
                <div className="progress-box__ground" />
                <div className="progress-box__tree progress-box__tree--one" />
                <div className="progress-box__tree progress-box__tree--two" />
                <div className="progress-box__tree progress-box__tree--three" />
                <div className="progress-box__line" />
                <div className="progress-box__runner" />
                <div className="progress-box__tag">
                  {stats.averageProgress}%
                </div>
                <div className="progress-box__cup">{stats.completedCourses}</div>
                <div className="progress-box__level">
                  {stats.averageProgress < 35
                    ? "Beginner"
                    : stats.averageProgress < 70
                    ? "Intermediate"
                    : "Advanced"}
                </div>
              </div>
            </section>

            <section className="courses-block">
              <h2 className="courses-block__title">Learning Summary</h2>

              <div className="status-box">
                
                <div className="status-box__item">
                  {completedCourses}/{stats.totalCourses} completed
                </div>

                <div className="status-box__item">
                  {courses.filter(c => c.assignment_status === "assigned").length} assigned
                </div>

                <div className="status-box__item">
                  {course.filter(c => c.assignment_status === "in_progress").length} in progress
                </div>
                
                <div className="status-box__item">
                  {stats.averageProgress}% avg progress
                </div>
            
              </div>
            
            </section>

            <section className="courses-block">
              <div className="courses-block__head">
                <h2 className="courses-block__title">Enrolled Courses</h2>
                <button
                  className="catalog-btn"
                  onClick={() => navigate("/catalog")}
                >
                  COURSE CATALOG
                </button>
              </div>

              <EnrolledList
                courses={courses}
                onCourseClick={(id) => navigate(`/course-details/${id}`)} 
              />

            </section>
          </div>

          <aside className="courses-page__side">
            <div className="calendar-box">
              <div className="calendar-box__title">Sept 2023</div>
              <div className="calendar-box__days">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
              <div className="calendar-box__dates">
                <span>26</span>
                <span>27</span>
                <span>28</span>
                <span>29</span>
                <span className="is-active">30</span>
                <span>01</span>
                <span className="is-outline">02</span>
              </div>
            </div>

            <div className="side-card">
              <div className="side-card__head">
                <div className="side-card__icon" />
                <div>
                  <div className="side-card__title">Due Date</div>
                  <div className="side-card__date">Oct 02, 2022</div>
                </div>
              </div>
              <div className="side-card__label">Assignment 04</div>
              <div className="side-card__text">
                Nisi, venenatis id cursus volutpat cursus interdum enim mauris.
              </div>
            </div>

            <div className="featured">
              <h2 className="featured__title">Featured</h2>

              {courses.slice(0, 2).map((course, index) => (
                <div
                  key={course.id}
                  className={`feature-card ${
                    index % 2 === 0 ? "feature-card--light" : "feature-card--dark"
                  }`}
                  onClick={() => navigate(`/course-details/${course.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="feature-card__image"
                    />
                  )}

                  <div className="feature-card__top">
                    <div className="feature-card__icon" />
                    <div className="feature-card__meta">
                      {course.lessons || 0} lessons ・ {course.quizzes || 0} quizzes
                    </div>
                  </div>

                  <div className="feature-card__sub">{course.title}</div>
                  <div className="feature-card__text">
                    {course.description || "No description available."}
                  </div>
                  <div className="feature-card__author">{course.instructor}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}