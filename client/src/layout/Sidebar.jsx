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
  ClipboardCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useReviewBadge } from "../context/ReviewBadgeContext";
import "../css/sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pendingReviews } = useReviewBadge();

  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const menuRef = useRef(null);

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "UP";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const navItems = useMemo(() => {
    const baseItems = [
      { icon: LayoutDashboard, id: "Dashboard", path: "/dashboard" },
      { icon: GraduationCap, id: "My Courses", path: "/my-courses" },
      { icon: BookOpen, id: "All Courses", path: "/catalog" },
      { icon: MessageSquare, id: "Discussion", path: "/discussion" },
      { icon: Radio, id: "Live Events", path: "/live" },
    ];

    if (user?.role === "admin" || user?.role === "trainer") {
      baseItems.splice(3, 0, { icon: Upload, id: "Upload", path: "/upload" });

      baseItems.push({
        icon: ClipboardCheck,
        id: "Reviews",
        path: "/reviews",
        badge: pendingReviews > 0 ? pendingReviews : null,
      });
    }

    if (user?.role === "admin") {
      baseItems.push({ icon: Shield, id: "Admin", path: "/admin" });
      baseItems.push({
        icon: Building2,
        id: "Organizations",
        path: "/organizations",
      });
    }

    if (user?.role === "principal") {
      baseItems.push({
        icon: Building2,
        id: "Educator Progress",
        path: "/educator-progress",
      });
    }

    if (user?.role === "educator") {
      baseItems.push({
        icon: FileText,
        id: "My Submissions",
        path: "/my-submissions",
      });
    }

    return baseItems;
  }, [user?.role, pendingReviews]);

  const displayUser = {
    name:
      user?.fullname ||
      user?.name ||
      localStorage.getItem("name") ||
      "UP Student",
    email: user?.email || localStorage.getItem("email") || "example@up.com",
    role: user?.role || "educator",
    photo: user?.photo || localStorage.getItem("photo") || null,
  };

  const shouldShowPhoto = Boolean(displayUser.photo && !imageError);

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
    setImageError(false);
  }, [displayUser.photo]);

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
              aria-label={item.id}
            >
              <div className="sidebar__iconWrap">
                <Icon size={24} />
                {item.badge ? (
                  <span className="sidebar__badge">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </div>
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
              {shouldShowPhoto ? (
                <img
                  src={displayUser.photo}
                  alt={displayUser.name}
                  className="sidebar__menuAvatar"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="sidebar__menuAvatar sidebar__menuAvatar--initials">
                  {getInitials(displayUser.name)}
                </div>
              )}

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
          {shouldShowPhoto ? (
            <img
              src={displayUser.photo}
              alt={displayUser.name}
              className="sidebar__profileImage"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="sidebar__profileInitials">
              {getInitials(displayUser.name)}
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}