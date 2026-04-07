import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  MessageSquare,
  Radio,
  BookOpen,
  Upload,
  LogOut,
  User,
  Shield,
  Building2,
  FileText,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import "../css/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const navItems = useMemo(() => {
    const baseItems = [
      { icon: LayoutDashboard, id: "dashboard", path: "/dashboard" },
      { icon: GraduationCap, id: "myCourses", path: "/my-courses" },
      { icon: BookOpen, id: "allCourses", path: "/catalog" },
      { icon: MessageSquare, id: "discussion", path: "/discussion" },
      { icon: Radio, id: "live", path: "/live" },
    ];

    if (user?.role === "admin" || user?.role === "trainer") {
      baseItems.splice(3, 0, { icon: Upload, id: "upload", path: "/upload" });
    }

    if (user?.role === "admin") {
      baseItems.push({
        icon: Shield,
        id: "admin",
        path: "/admin",
      });
      baseItems.push({
        icon: Building2,
        id: "organizations",
        path: "/organizations",
      });
    }

    if (user?.role === "principal") {
      baseItems.push({
        icon: Building2,
        id: "educatorProgress",
        path: "/educator-progress",
      });
    }

    if (user?.role === "educator") {
      baseItems.push({
        icon: FileText,
        id: "mySubmissions",
        path: "/my-submissions",
      });
    }

    return baseItems;
  }, [user]);

  const displayUser = {
    name:
      user?.fullname ||
      user?.name ||
      localStorage.getItem("name") ||
      "UP Student",
    email: user?.email || localStorage.getItem("email") || "example@up.com",
    role: user?.role || "educator",
    photo:
      user?.photo ||
      localStorage.getItem("photo") ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43b?auto=format&fit=crop&w=200&q=80",
  };

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
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
              title={item.id}
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
              onClick={handleProfileClick}
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <button
              type="button"
              className="sidebar__menuItem"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>

            <div className="sidebar__menuDivider" />

            <div className="sidebar__menuUser">
              <img
                src={displayUser.photo}
                alt={displayUser.name}
                className="sidebar__menuAvatar"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/images/default-avatar.png";
                }}
              />
              <div className="sidebar__menuUserText">
                <p className="sidebar__menuName">{displayUser.name}</p>
                <p className="sidebar__menuEmail">{displayUser.email}</p>
                <p className="sidebar__menuRole">
                  {displayUser.role.charAt(0).toUpperCase() +
                    displayUser.role.slice(1)}
                </p>
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
            src={displayUser.photo}
            alt={displayUser.name}
            className="sidebar__profileImage"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/images/default-avatar.png";
            }}
          />
        </button>
      </div>
    </aside>
  );
}