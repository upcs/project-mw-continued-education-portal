// pages/Dashboard.jsx
import DashboardLayout from "../layout/DashboardLayout";
import StatCard from "../components/StatCard";
import ChartCard from "../components/ChartCard";
import ActivityHeatmap from "../components/ActivityHeatmap";
import CourseCard from "../components/CourseCard";

export default function Dashboard() {
  return (
    <DashboardLayout>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard title="Courses" value="13" />
        <StatCard title="Students" value="240" />
        <StatCard title="Time" value="31h 15m" />
        <StatCard title="Sessions" value="7" />
      </div>

      {/* Charts + Heatmap */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ChartCard />
        <ActivityHeatmap />
      </div>

      {/* Courses */}
      <div className="grid grid-cols-3 gap-4">
        <CourseCard title="Learn Figma" description="UI/UX Design" />
        <CourseCard title="React Basics" description="Frontend Dev" />
        <CourseCard title="Node API" description="Backend Dev" />
      </div>

    </DashboardLayout>
  );
}