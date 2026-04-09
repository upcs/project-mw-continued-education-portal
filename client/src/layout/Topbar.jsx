import { Search, Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import "../css/topbar.css";
import API from "../api/api";

export default function Topbar() {
//search bar stuff
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);

  // ✅ Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await API.get("/courses");
	console.log("data: ", data);
	console.log("keys ", Object.keys(data));
        // Convert API data into searchable links
        const formattedLinks = data.data.map((item) => ({
          name: item.title,
          href: `http://cs341s26mwed.campus.up.edu:3000/course-details/${item.id}`,
        }));

        setLinks(formattedLinks);
      } catch (error) {
        console.error("API error:", error);
      }
    };

    fetchCourses();
  }, []);

  // ✅ Filter when user types
  useEffect(() => {
    const results = links.filter((link) =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(results);
  }, [searchTerm, links]);


//settings stuff
const [isSettingsOpen, setIsSettingsOpen] = useState(false);
const [isMuted, setIsMuted] = useState(false);
const [isDarkMode, setIsDarkMode] = useState(false);
const [notificationsEnabled, setNotificationsEnabled] = useState(true);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest(".settings-container")) setIsSettingsOpen(false);
  };
  document.addEventListener("click", handleClickOutside);
  return () => document.removeEventListener("click", handleClickOutside);
}, []);

useEffect(() => {
  document.body.classList.toggle("dark-mode", isDarkMode);
}, [isDarkMode]);

useEffect(() => {
  const media = document.querySelectorAll("audio, video");
  media.forEach(m => m.muted = isMuted);
}, [isMuted]);

//the react
  return (
    <header className="topbar">
      <h1 className="title">UPLENDO LEARNING PLATFORM</h1>

      <div className="topbar__search">
        <input
          className="topbar__input"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />

        <Search className="topbar__search-icon" size={18} />

        {isOpen && searchTerm && (
          <div className="dropdown">
            {filteredLinks.length > 0 ? (
              filteredLinks.map((link, index) => (
                <button
                  key={index}
                  className="dropdown-item"
                  onMouseDown={() => (window.location.href = link.href)}
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
        <button className="topbar__icon-btn">
          <Bell size={20} />
          <span className="topbar__notif-dot" />
        </button>

        <div className="settings-container">
  <button
    className="topbar__icon-btn"
    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
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
          onChange={() => setNotificationsEnabled(!notificationsEnabled)}
        />
      </label>
    </div>
  )}
</div>
      </div>
    </header>
  );
}
