import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Radio,
  BookOpen,
  Upload,
  LogOut,
  User,
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
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const user = {
    name: localStorage.getItem("name") || "UP Student",
    email: localStorage.getItem("email") || "example@up.com",
    photo:
      localStorage.getItem("photo") ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43b?auto=format&fit=crop&w=200&q=80",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    navigate("/profile");
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        <img
          className="UP-Logo"
          src="https://www.eduopinions.com/wp-content/uploads/2018/08/UniversityofPortland-logo-350x350.jpg"
          alt="University of Portland"
        />
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

      <div className="sidebar__profileWrapper" ref={menuRef}>
        {menuOpen && (
          <div className="sidebar__profileMenu">
            <button
              type="button"
              className="sidebar__menuItem"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            <button
              type="button"
              className="sidebar__menuItem"
              onClick={handleProfileClick}
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <div className="sidebar__menuDivider" />

            <div className="sidebar__menuUser">
              <img
                src={user.photo}
                alt={user.name}
                className="sidebar__menuAvatar"
                onError={(e) => {
                  e.currentTarget.src = 
                    "https://via.placeholder.com/80x80.png?text=User"
                }}
              />
              <div className="sidebar__menuUserText">
                <p className="sidebar__menuName">{user.name}</p>
                <p className="sidebar__menuEmail">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="sidebar__profileButton"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Open profile menu"
        >
          <img
            src={user.photo}
            alt={user.name}
            className="sidebar__profileImage"
            onError={(e) => {
              e.currentTarget.src = 
                "https://via.placeholder.com/80x80.png?text=User";
            }}
          />
        </button>
      </div>
    </aside>
  );
}