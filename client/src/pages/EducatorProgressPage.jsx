import { useEffect, useMemo, useState } from "react";
import "../css/principal-page.css";
import {
  getPrincipalDashboard,
  getPrincipalEducators,
  getPrincipalCourses,
  getPrincipalAssignments,
  assignCourseToEducator,
} from "../api/principal";

export default function EducatorProgressPage() {
  const [dashboard, setDashboard] = useState(null);
  const [educators, setEducators] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [selectedEducator, setSelectedEducator] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadPrincipalData = async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const [dashboardRes, educatorsRes, coursesRes, assignmentsRes] =
        await Promise.all([
          getPrincipalDashboard(),
          getPrincipalEducators(),
          getPrincipalCourses(),
          getPrincipalAssignments(),
        ]);

      setDashboard(dashboardRes?.data?.data || null);
      setEducators(educatorsRes?.data?.data || []);
      setCourses(coursesRes?.data?.data || []);
      setAssignments(assignmentsRes?.data?.data || []);
    } catch (err) {
      console.error("PRINCIPAL PAGE LOAD ERROR:", err);
      setError(err?.response?.data?.message || "Failed to load principal data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrincipalData();
  }, []);

  const educatorOptions = useMemo(() => educators || [], [educators]);

  const handleAssignCourse = async (e) => {
    e.preventDefault();

    if (!selectedEducator || !selectedCourse) {
      setError("Please select an educator and a course.");
      return;
    }

    try {
      setAssigning(true);
      setError("");
      setMessage("");

      await assignCourseToEducator({
        educatorEmail: selectedEducator,
        courseId: Number(selectedCourse),
      });

      setMessage("Course assigned successfully.");
      setSelectedEducator("");
      setSelectedCourse("");
      await loadPrincipalData();
    } catch (err) {
      console.error("ASSIGN COURSE ERROR:", err);
      setError(err?.response?.data?.message || "Failed to assign course.");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return <div className="principal-page">Loading principal dashboard...</div>;
  }

  return (
    <section className="principal-page">
      <header className="principal-page__header">
        <h1>Principal Dashboard</h1>
        <p>
          Monitor educators in {dashboard?.organizationName || "your organization"}
          and assign courses they need to complete.
        </p>
      </header>

      {message && <p className="principal-page__message">{message}</p>}
      {error && <p className="principal-page__error">{error}</p>}

      <div className="principal-stats-grid">
        <StatCard title="Educators" value={dashboard?.totalEducators || 0} />
        <StatCard title="Active Assignments" value={dashboard?.activeAssignments || 0} />
        <StatCard title="Completed Assignments" value={dashboard?.completedAssignments || 0} />
      </div>

      <div className="principal-page__grid">
        <section className="principal-card">
          <h2>Assign Course</h2>

          <form className="principal-assign-form" onSubmit={handleAssignCourse}>
            <select
              value={selectedEducator}
              onChange={(e) => setSelectedEducator(e.target.value)}
            >
              <option value="">Select educator</option>
              {educatorOptions.map((educator) => (
                <option key={educator.email} value={educator.email}>
                  {educator.fullname || educator.email}
                </option>
              ))}
            </select>

            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>

            <button type="submit" disabled={assigning}>
              {assigning ? "Assigning..." : "Assign Course"}
            </button>
          </form>
        </section>

        <section className="principal-card">
          <h2>Current Assignments</h2>

          {assignments.length === 0 ? (
            <p>No assignments yet.</p>
          ) : (
            <div className="principal-table-wrap">
              <table className="principal-table">
                <thead>
                  <tr>
                    <th>Educator</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((item) => (
                    <tr key={item.id}>
                      <td>{item.educator_name || item.educator_email}</td>
                      <td>{item.course_title}</td>
                      <td className="principal-table__status">{item.status}</td>
                      <td>{item.assigned_at}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="principal-card">
        <h2>Educator Performance</h2>

        {educators.length === 0 ? (
          <p>No educators found in your organization.</p>
        ) : (
          <div className="principal-table-wrap">
            <table className="principal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Specialization</th>
                  <th>Assigned Courses</th>
                  <th>Active Courses</th>
                  <th>Completed Courses</th>
                  <th>Average Grade</th>
                  <th>Latest Submission</th>
                </tr>
              </thead>
              <tbody>
                {educators.map((educator) => (
                  <tr key={educator.email}>
                    <td>{educator.fullname || "—"}</td>
                    <td>{educator.email}</td>
                    <td>{educator.specialization || "—"}</td>
                    <td>{educator.assignedCourses || 0}</td>
                    <td>{educator.activeCourses || 0}</td>
                    <td>{educator.completedCourses || 0}</td>
                    <td>{educator.averageGrade || "—"}</td>
                    <td>{educator.latestSubmissionAt || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="principal-stat-card">
      <p className="principal-stat-card__title">{title}</p>
      <h3 className="principal-stat-card__value">{value}</h3>
    </div>
  );
}