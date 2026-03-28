import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/sidebarProfile.css";

export default function SidebarProfile() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const user = {
    name: localStorage.getItem("name") || "Mohammad Shams Tabrez",
    email: localStorage.getItem("email") || "ms-07@outlook.com",
    photo:
      localStorage.getItem("photo") ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43b?auto=format&fit=crop&w=200&q=80",
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleProfile = () => {
    navigate("/profile");
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="sidebar-profile-wrapper" ref={menuRef}>
      {open && (
        <div className="sidebar-profile-menu">
          <button className="sidebar-profile-action" onClick={handleLogout}>
            <span className="sidebar-profile-icon">↪</span>
            Logout
          </button>

          <button className="sidebar-profile-action" onClick={handleProfile}>
            <span className="sidebar-profile-icon">◎</span>
            Profile
          </button>

          <div className="sidebar-profile-divider" />

          <div className="sidebar-profile-user">
            <img
              src={user.photo}
              alt={user.name}
              className="sidebar-profile-avatar-large"
            />
            <div className="sidebar-profile-user-text">
              <p className="sidebar-profile-name">{user.name}</p>
              <p className="sidebar-profile-email">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <button
        className="sidebar-profile-trigger"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Open profile menu"
      >
        <img
          src={user.photo}
          alt={user.name}
          className="sidebar-profile-avatar"
        />
      </button>
    </div>
  );
}