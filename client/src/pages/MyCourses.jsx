import { useEffect, useMemo, useState } from "react";
import "../css/my-courses.css";
import CourseCard from "../components/courses/CourseCard";
import API from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("default");
  const [trainerMode, setTrainerMode] = useState("mine");
  const [selectedTrainer, setSelectedTrainer] = useState("");

  const isTrainerView =
    user?.role === "trainer" ||
    (user?.role === "admin" && viewMode === "trainer");

  useEffect(() => {
    const loadTrainers = async () => {
      if (user?.role !== "admin") return;

      try {
        const { data } = await API.get("/admin/users");

        if (!data?.success) return;

        const trainerUsers = (data.data || []).filter(
          (u) => u.role === "trainer"
        );

        setTrainers(trainerUsers);
      } catch (err) {
        console.error("LOAD TRAINERS ERROR:", err);
      }
    };

    loadTrainers();
  }, [user]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await API.get("/courses/enrolled", {
          params: {
            asTrainer: isTrainerView,
            trainerEmail:
              user?.role === "admin" && trainerMode === "specific"
                ? selectedTrainer || undefined
                : undefined,
          },
        });

        if (!data?.success) {
          throw new Error(data?.message || "Failed to load courses");
        }

        setCourses(data.data || []);
      } catch (err) {
        console.error("MY COURSES ERROR:", err);
        setError(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load courses"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "admin" && isTrainerView && trainerMode === "specific" && !selectedTrainer) {
      setCourses([]);
      setLoading(false);
      return;
    }

    loadCourses();
  }, [isTrainerView, selectedTrainer, trainerMode, user]);

  const groupedCourses = useMemo(() => {
    const assigned = [];
    const inProgress = [];
    const completed = [];

    courses.forEach((course) => {
      const status = course.assignment_status || "assigned";

      if (status === "completed") {
        completed.push(course);
      } else if (status === "in_progress") {
        inProgress.push(course);
      } else {
        assigned.push(course);
      }
    });

    return {
      assigned,
      inProgress,
      completed,
    };
  }, [courses]);

  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const completedCourses = groupedCourses.completed.length;

    const averageProgress =
      totalCourses > 0
        ? Math.round(
            courses.reduce(
              (sum, course) => sum + (Number(course.progress) || 0),
              0
            ) / totalCourses
          )
        : 0;

    return {
      totalCourses,
      completedCourses,
      averageProgress,
    };
  }, [courses, groupedCourses]);

  if (loading) {
    return (
      <section className="my-courses-page">
        <h1 className="my-courses-page__title">My Courses</h1>
        <p>Loading courses...</p>
      </section>
    );
  }

  return (
    <section className="my-courses-page">
      <header className="my-courses-page__header">
        <div>
          <h1 className="my-courses-page__title">
            {isTrainerView ? "Trainer Contributions" : "My Courses"}
          </h1>

          <p className="my-courses-page__subtitle">
            {isTrainerView
              ? user?.role === "admin" &&
                trainerMode === "specific" &&
                selectedTrainer
                ? `Viewing contributed courses for ${selectedTrainer}`
                : "Viewing trainer-style contributed courses."
              : "Track your assigned, active, and completed learning."}
          </p>

          {user?.role === "admin" && (
            <div className="my-courses-admin-tools">
              <button
                type="button"
                className="my-courses-toggle-btn"
                onClick={() =>
                  setViewMode((prev) =>
                    prev === "trainer" ? "default" : "trainer"
                  )
                }
              >
                {viewMode === "trainer"
                  ? "← Back to Admin View"
                  : "View Trainer Contributions"}
              </button>

              {viewMode === "trainer" && (
                <div className="my-courses-trainer-controls">
                  <select
                    className="my-courses-select"
                    value={trainerMode}
                    onChange={(e) => {
                      setTrainerMode(e.target.value);
                      if (e.target.value === "mine") {
                        setSelectedTrainer("");
                      }
                    }}
                  >
                    <option value="mine">My Contributions</option>
                    <option value="specific">Specific Trainer</option>
                  </select>

                  {trainerMode === "specific" && (
                    <select
                      className="my-courses-select"
                      value={selectedTrainer}
                      onChange={(e) => setSelectedTrainer(e.target.value)}
                    >
                      <option value="">Select Trainer</option>
                      {trainers.map((trainer) => (
                        <option key={trainer.email} value={trainer.email}>
                          {trainer.fullname || trainer.email}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {error && <p className="my-courses-page__error">{error}</p>}

      {isTrainerView ? (
        <>
          {!loading && courses.length === 0 && (
            <div className="my-courses-empty">
              <h3>No courses yet</h3>
              <p>
                {user?.role === "admin" && trainerMode === "specific"
                  ? selectedTrainer
                    ? "This trainer has not contributed to any courses."
                    : "Select a trainer to view contributions."
                  : "No contributed courses found."}
              </p>
            </div>
          )}

          <div className="my-courses-grid">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                author={course.instructor}
                lessons={course.lessons}
                quizzes={course.quizzes}
                thumbnail={course.thumbnail}
                progress={course.progress}
                sourceLabel={course.contribution_type || ""}
                actionLabel="Manage"
                onAction={() => navigate(`/course-details/${course.id}`)}
              />
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="my-courses-stats">
            <div className="my-courses-stat-card">
              <p>Total Courses</p>
              <h3>{stats.totalCourses}</h3>
            </div>

            <div className="my-courses-stat-card">
              <p>Completed</p>
              <h3>{stats.completedCourses}</h3>
            </div>

            <div className="my-courses-stat-card">
              <p>Average Progress</p>
              <h3>{stats.averageProgress}%</h3>
            </div>
          </div>

          {!error && courses.length === 0 && (
            <div className="my-courses-empty">
              <h3>No courses yet</h3>
              <p>You have not been assigned or enrolled in any courses.</p>
            </div>
          )}

          <CourseSection
            title="In Progress"
            count={groupedCourses.inProgress.length}
            courses={groupedCourses.inProgress}
            emptyText="No courses in progress."
          />

          <CourseSection
            title="Completed"
            count={groupedCourses.completed.length}
            courses={groupedCourses.completed}
            emptyText="No completed courses yet."
          />

          <CourseSection
            title="Assigned"
            count={groupedCourses.assigned.length}
            courses={groupedCourses.assigned}
            emptyText="No assigned courses."
          />
        </>
      )}
    </section>
  );
}

function CourseSection({ title, count, courses, emptyText }) {
  const navigate = useNavigate();

  return (
    <section className="my-courses-section">
      <div className="my-courses-section__header">
        <h2>{title}</h2>
        <span>{count}</span>
      </div>

      {courses.length === 0 ? (
        <p className="my-courses-section__empty">{emptyText}</p>
      ) : (
        <div className="my-courses-grid">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              author={course.instructor}
              lessons={course.lessons}
              quizzes={course.quizzes}
              thumbnail={course.thumbnail}
              progress={course.progress}
              statusLabel={course.assignment_status}
              sourceLabel={
                course.contribution_type ||
                (course.source === "principal"
                  ? "Principal Assigned"
                  : course.source === "self"
                  ? "Self Enrolled"
                  : "")
              }
              actionLabel={
                course.assignment_status === "completed"
                  ? "Completed"
                  : "Continue"
              }
              actionDisabled={course.assignment_status === "completed"}
              onAction={
                course.assignment_status === "completed"
                  ? null
                  : () => navigate(`/course-details/${course.id}`)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
