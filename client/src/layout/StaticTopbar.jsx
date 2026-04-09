import { Search, Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import "../css/topbar.css";

export default function Topbar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filteredLinks, setFilteredLinks] = useState([]);

  // ✅ STATIC DATA
  const links = [
    { name: "React Course", href: "/" },
    { name: "JavaScript Basics", href: "/" },
    { name: "CSS Mastery", href: "/" },
    { name: "Node.js Guide", href: "/" },
    { name: "Python for Beginners", href: "/" },
  ];

  // ✅ FILTER LOGIC
  useEffect(() => {
    const results = links.filter((link) =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLinks(results);
  }, [searchTerm]);

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
                  onMouseDown={() => alert(link.name)}
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

        <button className="topbar__icon-btn">
          <Settings size={20} />
        </button>
      </div>
    </header>
  );
}
