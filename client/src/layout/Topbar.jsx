import { Search, Bell, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import "../css/topbar.css";
import API from "../api/api";

export default function Topbar() {
  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);

  const hasUnreadNotifications = useMemo(
    () => notificationsEnabled && unreadCount > 0,
    [notificationsEnabled, unreadCount]
  );

  // Fetch searchable courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await API.get("/courses");

        const formattedLinks = (data?.data || []).map((item) => ({
          name: item.title,
          href: `/course-details/${item.id}`,
        }));

        setLinks(formattedLinks);
      } catch (error) {
        console.error("API error while loading courses:", error);
      }
    };

    fetchCourses();
  }, []);

  // Filter search results
  useEffect(() => {
    const results = links.filter((link) =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(results);
  }, [searchTerm, links]);

  // Load notifications for the logged-in user only
  const loadNotifications = async () => {
    if (!notificationsEnabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const [notificationsRes, unreadCountRes] = await Promise.all([
        API.get("/notifications"),
        API.get("/notifications/unread-count"),
      ]);

      setNotifications(notificationsRes?.data?.data || []);
      setUnreadCount(Number(unreadCountRes?.data?.unreadCount || 0));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [notificationsEnabled]);

  // Optional polling so notifications refresh automatically
  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target)
      ) {
        setIsNotificationsOpen(false);
      }

      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  // Mute media
  useEffect(() => {
    const media = document.querySelectorAll("audio, video");
    media.forEach((m) => {
      m.muted = isMuted;
    });
  }, [isMuted]);

  const toggleNotificationsMenu = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (nextOpen && notificationsEnabled) {
      await loadNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification?.isRead) {
        await API.post(`/notifications/${notification.id}/read`);
      }

      await loadNotifications();

      if (notification?.link) {
        window.location.href = notification.link;
      } else {
        setIsNotificationsOpen(false);
      }
    } catch (error) {
      console.error("Failed to open notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.post("/notifications/read-all");
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  return (
    <header className="topbar">
      <h1 className="title">UPLENDO LEARNING PLATFORM</h1>

      <div className="topbar__search">
        <input
          className="topbar__input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchOpen(true)}
          onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
        />

        <Search className="topbar__search-icon" size={18} />

        {isSearchOpen && searchTerm && (
          <div className="dropdown">
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link, index) => (
                <button
                  key={`${link.href}-${index}`}
                  className="dropdown-item"
                  onMouseDown={() => {
                    window.location.href = link.href;
                  }}
                >
                  {link.name}
                </button>
              ))
            ) : (
              <div className="dropdown-empty">No results found</div>
            )}
          </div>
        )}
      </div>

      <div className="topbar__actions">
        <div className="settings-container" ref={notificationsRef}>
          <button
            className="topbar__icon-btn"
            onClick={toggleNotificationsMenu}
            aria-label="Open notifications"
            type="button"
          >
            <Bell size={20} />
            {hasUnreadNotifications && <span className="topbar__notif-dot" />}
          </button>

          {isNotificationsOpen && (
            <div className="settings-dropdown">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <h4 style={{ margin: 0 }}>Notifications</h4>

                {notifications.length > 0 && unreadCount > 0 && (
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={handleMarkAllAsRead}
                    style={{ width: "auto", padding: "6px 10px" }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {!notificationsEnabled ? (
                <div className="dropdown-empty">
                  Notifications are turned off in settings
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleNotificationClick(notification)}
                    style={{
                      display: "block",
                      textAlign: "left",
                      fontWeight: notification.isRead ? "normal" : "600",
                    }}
                  >
                    <div>{notification.title}</div>
                    <div style={{ fontSize: "12px", opacity: 0.8 }}>
                      {notification.message}
                    </div>
                  </button>
                ))
              ) : (
                <div className="dropdown-empty">No notifications</div>
              )}
            </div>
          )}
        </div>

        <div className="settings-container" ref={settingsRef}>
          <button
            className="topbar__icon-btn"
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            aria-label="Open settings"
            type="button"
          >
            <Settings size={20} />
          </button>

          {isSettingsOpen && (
            <div className="settings-dropdown">
              <h4>Settings</h4>

              <label className="settings-option">
                <span>Mute</span>
                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={() => setIsMuted(!isMuted)}
                />
              </label>

              <label className="settings-option">
                <span>Dark Mode</span>
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={() => setIsDarkMode(!isDarkMode)}
                />
              </label>

              <label className="settings-option">
                <span>Notifications</span>
                <input
                  type="checkbox"
                  checked={notificationsEnabled}
                  onChange={() =>
                    setNotificationsEnabled(!notificationsEnabled)
                  }
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
