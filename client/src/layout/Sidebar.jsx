import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Radio,
  BookOpen,
  Upload,
} from "lucide-react";
import "../css/sidebar.css";

const navItems = [
  { icon: LayoutDashboard, id: "dashboard", path: "/dashboard" },
  { icon: GraduationCap, id: "myCourses", path: "/my-courses" },
  { icon: BookOpen, id: "allCourses", path: "/catalog" },
  { icon: Upload, id: "upload", path: "/upload" },
  { icon: MessageSquare, id: "discussion", path: "/discussion" },
  { icon: Radio, id: "live", path: "/live" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img className="UP-Logo" src="https://www.eduopinions.com/wp-content/uploads/2018/08/UniversityofPortland-logo-350x350.jpg" alt="" />
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) =>
                `sidebar__item ${isActive ? "sidebar__item--active" : ""}`
              }
            >
              <Icon size={24} />
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__profile">🙂</div>
    </aside>
  );
}