import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  GraduationCap,
  Lightbulb,
  MessageSquare,
  Radio,
  BookOpen,
} from "lucide-react";
import "../css/sidebar.css";

const navItems = [
  { icon: LayoutDashboard, id: "dashboard", path: "/" },
  { icon: GraduationCap, id: "myCourses", path: "/my-courses" },
  { icon: BookOpen, path: "/catalog" },
  { icon: Lightbulb, id: "prototypes", path: "/prototypes" },
  { icon: MessageSquare, id: "discussion", path: "/discussion" },
  { icon: Radio, id: "live", path: "/live" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__logo">MOLP</div>

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